#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Running Go Linting Suite..."
echo "================================"

# Track if any linter fails
FAILED=0

# Go fmt
echo -e "\n${YELLOW}Running go fmt...${NC}"
if ! gofmt -l . | grep -v vendor | grep -v examples; then
    echo -e "${GREEN}✓ Code is properly formatted${NC}"
else
    echo -e "${RED}✗ Code formatting issues found. Run 'go fmt ./...'${NC}"
    FAILED=1
fi

# Go vet
echo -e "\n${YELLOW}Running go vet...${NC}"
VET_OUTPUT=$(go vet ./... 2>&1 | grep -v vendor || true)
if [ -z "$VET_OUTPUT" ]; then
    echo -e "${GREEN}✓ No issues found with go vet${NC}"
else
    echo "$VET_OUTPUT"
    echo -e "${RED}✗ Issues found with go vet${NC}"
    FAILED=1
fi

# Staticcheck
echo -e "\n${YELLOW}Running staticcheck...${NC}"
if command -v staticcheck &> /dev/null; then
    if staticcheck ./...; then
        echo -e "${GREEN}✓ No issues found with staticcheck${NC}"
    else
        echo -e "${RED}✗ Issues found with staticcheck${NC}"
        FAILED=1
    fi
else
    echo -e "${YELLOW}⚠ staticcheck not installed. Install with: go install honnef.co/go/tools/cmd/staticcheck@latest${NC}"
fi

# Ineffassign
echo -e "\n${YELLOW}Checking for ineffectual assignments...${NC}"
if command -v ineffassign &> /dev/null; then
    if ineffassign ./...; then
        echo -e "${GREEN}✓ No ineffectual assignments found${NC}"
    else
        echo -e "${RED}✗ Ineffectual assignments found${NC}"
        FAILED=1
    fi
else
    echo -e "${YELLOW}⚠ ineffassign not installed. Install with: go install github.com/gordonklaus/ineffassign@latest${NC}"
fi

# Deadcode
echo -e "\n${YELLOW}Checking for dead code...${NC}"
if command -v deadcode &> /dev/null; then
    DEAD_CODE=$(deadcode . 2>&1 | grep -v vendor | grep -v examples)
    if [ -z "$DEAD_CODE" ]; then
        echo -e "${GREEN}✓ No dead code found${NC}"
    else
        echo -e "${RED}✗ Dead code found:${NC}"
        echo "$DEAD_CODE"
        FAILED=1
    fi
else
    echo -e "${YELLOW}⚠ deadcode not installed. Install with: go install github.com/remyoudompheng/go-misc/deadcode@latest${NC}"
fi

# Check for unchecked errors
echo -e "\n${YELLOW}Checking for unchecked errors...${NC}"
if command -v errcheck &> /dev/null; then
    if errcheck ./...; then
        echo -e "${GREEN}✓ All errors are properly checked${NC}"
    else
        echo -e "${RED}✗ Unchecked errors found${NC}"
        FAILED=1
    fi
else
    echo -e "${YELLOW}⚠ errcheck not installed. Install with: go install github.com/kisielk/errcheck@latest${NC}"
fi

# Revive linting
echo -e "\n${YELLOW}Running revive...${NC}"
if command -v revive &> /dev/null; then
    if revive -set_exit_status -config revive.toml -formatter friendly ./...; then
        echo -e "${GREEN}✓ Revive passed with no issues${NC}"
    else
        echo -e "${RED}✗ Revive reported issues${NC}"
        FAILED=1
    fi
else
    echo -e "${YELLOW}⚠ revive not installed. Install with: go install github.com/mgechev/revive@latest${NC}"
fi

# Summary
echo -e "\n================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
