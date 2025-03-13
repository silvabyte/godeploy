export function changeBackgroundColor(color: string) {
  document.getElementsByTagName('html')[0].classList.add('bg-' + color);
}
