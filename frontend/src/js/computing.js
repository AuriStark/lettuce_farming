
export async function computesSeedPositions(cropType, fieldBondary, plantDistance) {
    const { x, y, width, height } = fieldBondary;

    if(width <= 0) return []
    if(height <= 0) return []
    if(plantDistance <= 10) return []

    let poss = [];

    let n = parseInt(width / plantDistance);
    let m = parseInt(height / plantDistance);

    if(n < 1 || m < 1) return []

    console.log("---->", n, m)

    for (let i = 0; i < n; i++) {
      let plantX = x + plantDistance * (i + (1 / 2));

      for (let j = 0; j < m; j++) {
        let plantY = y + plantDistance * (j + (1 / 2));

        poss.push({ cropType, x: plantX, y: plantY });
      }
    }

    console.log("xxxx---->", poss)

    return poss;
  }