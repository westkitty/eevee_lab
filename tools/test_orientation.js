const { chromium } = require('./playwright_support').resolvePlaywright();
const baseUrl = (process.env.EEVEE_TEST_BASE_URL || 'http://localhost:8099').replace(/\/$/, '');
let browser;

async function testOrientation() {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/test_gltf.html`);
  await page.waitForFunction(() => window.allDone === true, { timeout: 15000 });
  
  const orientationData = await page.evaluate(async () => {
    const species = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
    const loader = new THREE.GLTFLoader();
    const results = {};
    
    for (const sp of species) {
      await new Promise(resolve => {
        loader.load(`assets/models/${sp}.glb`, (gltf) => {
          const model = gltf.scene;
          const wrapper = new THREE.Group();
          wrapper.add(model);
          
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);
          
          const targetH = sp === 'eevee' ? 0.95 : 1.35;
          const s = targetH / size.y;
          model.scale.setScalar(s);
          model.position.x = -center.x * s;
          model.position.y = -box.min.y * s;
          model.position.z = -center.z * s;
          
          wrapper.updateMatrixWorld(true);
          
          // Find head and tail bones or vertices
          let headObj = null, tailObj = null;
          model.traverse(c => {
            const name = c.name.toLowerCase();
            if (!headObj && (name.includes('head') || name.includes('nose'))) headObj = c;
            if (!tailObj && name.includes('tail')) tailObj = c;
          });
          
          const headPos = new THREE.Vector3();
          const tailPos = new THREE.Vector3();
          if (headObj) headObj.getWorldPosition(headPos);
          if (tailObj) tailObj.getWorldPosition(tailPos);
          
          const normalizedBox = new THREE.Box3().setFromObject(wrapper);
          const normSize = new THREE.Vector3();
          normalizedBox.getSize(normSize);
          
          results[sp] = {
            targetHeight: targetH,
            actualHeight: normSize.y,
            groundMinY: normalizedBox.min.y,
            headZ: headObj ? headPos.z : 'none',
            tailZ: tailObj ? tailPos.z : 'none',
            facesForward: headObj && tailObj ? headPos.z > tailPos.z : 'unknown'
          };
          resolve();
        });
      });
    }
    return results;
  });
  
  console.log('ORIENTATION AND BOUNDS RESULTS:\n', JSON.stringify(orientationData, null, 2));
  await browser.close();
}

testOrientation().catch(async error => {
  console.error(error);
  if (browser) await browser.close().catch(() => {});
  process.exitCode = 1;
});
