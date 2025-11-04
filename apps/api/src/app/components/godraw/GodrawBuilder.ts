import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { zipSync } from "fflate";
import type { Result } from "../../types/result.types";
import { GodrawPageService } from "./GodrawPageService";
import { GodrawProjectService } from "./GodrawProjectService";
import type { GodrawPage } from "./godraw.types";

interface BuildOptions {
	projectId: string;
	tenantId: string;
}

interface BuildResult {
	archivePath: string;
	pageCount: number;
	buildTime: number;
}

interface ExcalidrawElementData {
	type?: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	strokeColor?: string;
	backgroundColor?: string;
	text?: string;
	customData?: {
		link?: string;
	};
}

/**
 * Service for building static sites from GoDraw projects
 */
export class GodrawBuilder {
	private readonly godrawProjectService: GodrawProjectService;
	private readonly godrawPageService: GodrawPageService;

	constructor() {
		this.godrawProjectService = new GodrawProjectService();
		this.godrawPageService = new GodrawPageService();
	}

	/**
	 * Build a static site from a GoDraw project
	 */
	async build(options: BuildOptions): Promise<Result<BuildResult>> {
		const startTime = Date.now();

		try {
			// 1. Fetch project and pages
			const projectResult = await this.godrawProjectService.getByProjectId(
				options.projectId,
			);
			if (projectResult.error || !projectResult.data) {
				return { data: null, error: "GoDraw project not found" };
			}

			const pagesResult = await this.godrawPageService.getPagesByProjectId(
				projectResult.data.id,
				false, // Only published pages
			);

			if (pagesResult.error) {
				return { data: null, error: pagesResult.error };
			}

			const pages = pagesResult.data || [];
			if (pages.length === 0) {
				return { data: null, error: "No published pages to build" };
			}

			// 2. Create temporary build directory
			const buildDir = await fs.mkdtemp(
				path.join(os.tmpdir(), "godraw-build-"),
			);

			// 3. Generate HTML for each page
			await this.generatePages(
				buildDir,
				pages,
				projectResult.data.theme,
				options.projectId,
			);

			// 4. Copy static assets
			await this.copyStaticAssets(buildDir);

			// 5. Create zip archive
			const archivePath = await this.createArchive(buildDir);

			// 6. Cleanup build directory
			await fs.rm(buildDir, { recursive: true, force: true });

			const buildTime = Date.now() - startTime;

			return {
				data: {
					archivePath,
					pageCount: pages.length,
					buildTime,
				},
				error: null,
			};
		} catch (error) {
			return {
				data: null,
				error: `Build failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Generate HTML pages from GoDraw pages
	 */
	private async generatePages(
		buildDir: string,
		pages: GodrawPage[],
		theme: "light" | "dark",
		projectId: string,
	): Promise<void> {
		// Read HTML template
		const templatePath = path.join(__dirname, "templates", "page.html");
		const template = await fs.readFile(templatePath, "utf-8");

		// Generate navigation HTML
		const navigation = pages
			.map((page) => {
				const href = page.slug === "home" ? "/" : `/${page.slug}.html`;
				return `<li><a href="${href}">${this.escapeHtml(page.name)}</a></li>`;
			})
			.join("\n      ");

		// Generate each page
		for (const page of pages) {
			const canvasContent = await this.renderCanvas(page);
			const fileName =
				page.slug === "home" ? "index.html" : `${page.slug}.html`;

			const html = template
				.replace(/{{THEME}}/g, theme)
				.replace(/{{PAGE_TITLE}}/g, this.escapeHtml(page.name))
				.replace(/{{PROJECT_NAME}}/g, projectId) // TODO: Get actual project name
				.replace(/{{PAGE_DESCRIPTION}}/g, `Created with GoDraw`)
				.replace(/{{PAGE_URL}}/g, `/${page.slug}`)
				.replace(/{{NAVIGATION}}/g, navigation)
				.replace(/{{CANVAS_CONTENT}}/g, canvasContent);

			await fs.writeFile(path.join(buildDir, fileName), html, "utf-8");
		}
	}

	/**
	 * Render Excalidraw canvas to SVG
	 */
	private async renderCanvas(page: GodrawPage): Promise<string> {
		// For now, create a simple SVG container
		// In a full implementation, we'd use @excalidraw/excalidraw's exportToSvg
		// But that requires browser environment or complex server-side rendering

		const elements = page.elements as ExcalidrawElementData[];

		if (elements.length === 0) {
			return '<div class="godraw-loading">Empty canvas - draw something in the editor!</div>';
		}

		// Calculate canvas bounds
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;

		for (const el of elements) {
			if (typeof el.x === "number" && typeof el.y === "number") {
				minX = Math.min(minX, el.x);
				minY = Math.min(minY, el.y);
				maxX = Math.max(maxX, el.x + (el.width || 0));
				maxY = Math.max(maxY, el.y + (el.height || 0));
			}
		}

		const width = maxX - minX + 40; // Add padding
		const height = maxY - minY + 40;

		// Generate simple SVG representation
		// Note: This is a simplified version. For production, use proper Excalidraw export
		const shapes = elements
			.map((el) => this.elementToSVG(el, minX - 20, minY - 20))
			.filter(Boolean)
			.join("\n    ");

		return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="transparent"/>
  ${shapes}
</svg>
<p style="text-align: center; color: #9ca3af; margin-top: 1rem; font-size: 0.875rem;">
  Created with GoDraw
</p>`;
	}

	/**
	 * Convert Excalidraw element to SVG (simplified)
	 */
	private elementToSVG(
		element: ExcalidrawElementData,
		offsetX: number,
		offsetY: number,
	): string {
		const x = (element.x || 0) - offsetX;
		const y = (element.y || 0) - offsetY;
		const width = element.width || 100;
		const height = element.height || 100;
		const strokeColor = element.strokeColor || "#000000";
		const fillColor = element.backgroundColor || "transparent";

		// Handle links
		const linkAttr = element.customData?.link
			? ` data-godraw-link="${this.escapeHtml(element.customData.link)}"`
			: "";

		switch (element.type) {
			case "rectangle":
				return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"${linkAttr}/>`;
			case "ellipse":
				return `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2}" ry="${height / 2}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"${linkAttr}/>`;
			case "text":
				return `<text x="${x}" y="${y + 20}" fill="${strokeColor}" font-size="16"${linkAttr}>${this.escapeHtml(element.text || "")}</text>`;
			case "line":
			case "arrow":
				// Simplified line rendering
				return `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" stroke="${strokeColor}" stroke-width="2"${linkAttr}/>`;
			default:
				// Fallback for unknown types
				return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="4"${linkAttr}/>`;
		}
	}

	/**
	 * Copy static assets to build directory
	 */
	private async copyStaticAssets(buildDir: string): Promise<void> {
		const assetsDir = path.join(buildDir, "assets");
		await fs.mkdir(assetsDir, { recursive: true });

		const templatesDir = path.join(__dirname, "templates");

		// Copy CSS
		const cssSource = path.join(templatesDir, "godraw.css");
		const cssDest = path.join(assetsDir, "godraw.css");
		await fs.copyFile(cssSource, cssDest);

		// Copy JS
		const jsSource = path.join(templatesDir, "godraw.js");
		const jsDest = path.join(assetsDir, "godraw.js");
		await fs.copyFile(jsSource, jsDest);
	}

	/**
	 * Create zip archive from build directory
	 */
	private async createArchive(buildDir: string): Promise<string> {
		const files: Record<string, Uint8Array> = {};

		// Read all files recursively
		await this.readDirRecursive(buildDir, buildDir, files);

		// Create zip
		const zipped = zipSync(files, { level: 6 });

		// Write to temp file
		const archivePath = path.join(os.tmpdir(), `godraw-${Date.now()}.zip`);
		await fs.writeFile(archivePath, zipped);

		return archivePath;
	}

	/**
	 * Read directory recursively
	 */
	private async readDirRecursive(
		dir: string,
		baseDir: string,
		files: Record<string, Uint8Array>,
	): Promise<void> {
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				await this.readDirRecursive(fullPath, baseDir, files);
			} else {
				const content = await fs.readFile(fullPath);
				const relativePath = path.relative(baseDir, fullPath);
				files[relativePath] = new Uint8Array(content);
			}
		}
	}

	/**
	 * Escape HTML special characters
	 */
	private escapeHtml(text: string): string {
		const map: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#039;",
		};
		return text.replace(/[&<>"']/g, (m) => map[m] || m);
	}
}
