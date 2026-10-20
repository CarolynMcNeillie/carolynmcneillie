# Local browser dependencies

Official npm package archives (unmodified ESM files and their licences: three MIT, delaunator ISC, robust-predicates Unlicense):

- three 0.171.0: https://registry.npmjs.org/three/-/three-0.171.0.tgz
- delaunator 5.0.1: https://registry.npmjs.org/delaunator/-/delaunator-5.0.1.tgz
- robust-predicates 3.0.2 (delaunator dependency): https://registry.npmjs.org/robust-predicates/-/robust-predicates-3.0.2.tgz

SHA-256 of vendored JavaScript (`shasum -a 256 vendor/**/*.js` with recursive glob support, or `find vendor -name '*.js' -exec shasum -a 256 {} +`):

```
b54705636e2190fa8b8ccaa7212407340b5b4248a86fda2709a5a15798880b3e  vendor/three/build/three.core.min.js
7beca683cc871059d68974082de4a98e3e589ae0c4322f1a22a25954d97552f1  vendor/three/build/three.module.min.js
ffe21e98ec99e876f1865bfc990d2ad302464f6b400f3295571fa5fc41abddfc  vendor/three/addons/controls/OrbitControls.js
57a4c5343fdcddde0ac08e5aa7092ced682e2d47e7fbdc402c5228e7ab343e82  vendor/delaunator/index.js
1e26fb2e616a0fa84dadb3a15633d9743671884d82f1abb124e20292fd0ab86d  vendor/robust-predicates/index.js
784e4c897b00289869c9a9e51e0281ac550853e399a8df664afaf29494fe85b5  vendor/robust-predicates/esm/incircle.js
5729d8c87b8f9c056fd7239b39898bdbf0c4f204290a356acc13d29c82ff5e9e  vendor/robust-predicates/esm/insphere.js
ba1af2b1ea71924fa2e0a3e50b8972d3a83ab9a9f406dd73e851c9763a8eb741  vendor/robust-predicates/esm/orient2d.js
c4f1939938354b1129f55b3832196d633ed307799699992447b2d3d4fd75d8f8  vendor/robust-predicates/esm/orient3d.js
97801e98a1cc91a330fe1b0e56bd5254d6a1305eb7cd2cb8e25c8b69212dcfa9  vendor/robust-predicates/esm/util.js
```
