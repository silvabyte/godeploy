export class StringFormatter {
  private value: string

  private constructor(value: string) {
    this.value = value
  }

  private escapeRegExp = (s: string) => s.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')

  static from(str: string): StringFormatter {
    return new StringFormatter(str)
  }

  remove = (() => {
    const self = this
    return Object.assign(
      (str: string) => {
        self.value = self.value.split(str).join('')
        return self
      },
      {
        leading(char: string) {
          const escaped = self.escapeRegExp(char)
          const reg = new RegExp(`^${escaped}+`)
          self.value = self.value.replace(reg, '')
          return self
        },
        trailing(char: string) {
          const escaped = self.escapeRegExp(char)
          const reg = new RegExp(`${escaped}+$`)
          self.value = self.value.replace(reg, '')
          return self
        },
      },
    )
  })()

  toString(): string {
    return this.value
  }
}
