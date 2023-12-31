export const uuidV4 = (): string => {
  const foo: any = [1e7]
  return (foo + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    // tslint:disable-next-line: no-bitwise
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  )
}
