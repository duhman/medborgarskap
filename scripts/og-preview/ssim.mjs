/**
 * Grayscale SSIM between two same-size RGBA buffers (1200x630).
 * Used for loop closure and fixed-band stability checks.
 */
export function computeSsim(a, b, width, height) {
  const K1 = 0.01
  const K2 = 0.03
  const L = 255
  const C1 = (K1 * L) ** 2
  const C2 = (K2 * L) ** 2

  let muA = 0
  let muB = 0
  let sigmaA2 = 0
  let sigmaB2 = 0
  let sigmaAB = 0
  const n = width * height

  for (let i = 0; i < a.length; i += 4) {
    const ya = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2]
    const yb = 0.299 * b[i] + 0.587 * b[i + 1] + 0.114 * b[i + 2]
    muA += ya
    muB += yb
  }
  muA /= n
  muB /= n

  for (let i = 0; i < a.length; i += 4) {
    const ya = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2]
    const yb = 0.299 * b[i] + 0.587 * b[i + 1] + 0.114 * b[i + 2]
    sigmaA2 += (ya - muA) ** 2
    sigmaB2 += (yb - muB) ** 2
    sigmaAB += (ya - muA) * (yb - muB)
  }
  sigmaA2 /= n - 1
  sigmaB2 /= n - 1
  sigmaAB /= n - 1

  const num = (2 * muA * muB + C1) * (2 * sigmaAB + C2)
  const den = (muA ** 2 + muB ** 2 + C1) * (sigmaA2 + sigmaB2 + C2)
  return num / den
}

export function bandRegionSsim(a, b, width) {
  const top = 60
  const bottom = 130
  const rowBytes = width * 4
  const outA = Buffer.alloc((bottom - top) * rowBytes)
  const outB = Buffer.alloc((bottom - top) * rowBytes)
  for (let y = top; y < bottom; y++) {
    const start = y * rowBytes
    a.copy(outA, (y - top) * rowBytes, start, start + rowBytes)
    b.copy(outB, (y - top) * rowBytes, start, start + rowBytes)
  }
  return computeSsim(outA, outB, width, bottom - top)
}
