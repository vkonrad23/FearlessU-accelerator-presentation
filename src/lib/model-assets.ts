export function isLocalModelPath(path: string) {
  return /^\/models\/[a-zA-Z0-9/_-]+\.glb$/.test(path) && !path.includes('..');
}
