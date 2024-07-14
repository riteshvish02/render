import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'

const textureLoader = new THREE.TextureLoader()
const floorgrid =  textureLoader.load('/textures/grid-texture.png')
const floorterrain =  textureLoader.load('/textures/terrain-normal.jpg')
const floorrough =  textureLoader.load('/textures/terrain-roughness.jpg')

const gltfLoader = new GLTFLoader()
const cubetexture = new THREE.CubeTextureLoader()
// import gsap from 'gsap'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/'); // Path to the folder containing the decoder files
dracoLoader.setDecoderConfig({ type: 'wasm', url: '/draco/draco_decoder.wasm' })
gltfLoader.setDRACOLoader(dracoLoader)
const env = cubetexture.load(
    [
        '/textures/environmentMaps/2/px.jpg',
        '/textures/environmentMaps/2/nx.jpg',
        '/textures/environmentMaps/2/py.jpg',
        '/textures/environmentMaps/2/ny.jpg',
        '/textures/environmentMaps/2/pz.jpg',
        '/textures/environmentMaps/2/nz.jpg',
    ]
) 

gltfLoader.load(
    '/models/scene.glb',
    (gltf)=>{
        console.log(gltf.scene);
        gltf.scene.scale.set(17,17,17)
        gltf.scene.position.set(0,-4,0)
        gltf.scene.rotation.y = Math.PI / 2
        scene.add(gltf.scene)
        gui.add(gltf.scene.rotation,'y').min(-Math.PI).max(Math.PI).step(0.001).name('Rotation')
        updateMaterial()
    }

)
let carPaintMesh = null;

const updateMaterial = ()=>{
    scene.traverse((child)=>{
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial){
            child.material.envMap = env
            // child.material.color.set('#ff0000');
            child.material.envMapIntensity = Debugobj.intensity 
            child.castShadow = true
            child.receiveShadow = true
        }
        if (child.isMesh && child.material.name === 'EXT_Carpaint.004') {
            carPaintMesh = child;
        }
    })
}

const changeCarPaintColor = (color) => {
    if (carPaintMesh) {
        carPaintMesh.material.color.set(color);
    }
}


/**
 * Base
 */
// Debug
const gui = new dat.GUI({width: 400,height: 400,scale:2})


const Debugobj = {}
Debugobj.intensity = 1
gui.add(Debugobj,'intensity').max(10).min(1).step(1).name('intensityEnvMap').onChange(updateMaterial)
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


const directionlight = new THREE.DirectionalLight('#ffffff',1.3   )
directionlight.position.set(0.25,3,-2.25)
scene.add(directionlight)
gui.add(directionlight,'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionlight.position,'x').min(-5).max(5).step(0.001).name('lightX')
gui.add(directionlight.position,'y').min(-5).max(5).step(0.001).name('lightY')
gui.add(directionlight.position,'z').min(-5).max(5).step(0.001).name('lightZ')


//floor

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ 
        color: 'black',
        // aoMap:grassambientOcclusiontexture,
        normalMap:floorterrain,
        roughnessMap:floorrough,
     })
)
floorrough.repeat.set(1,1)
floorterrain.repeat.set(5,5)


floorterrain.wrapS = THREE.RepeatWrapping
floorrough.wrapT = THREE.RepeatWrapping

floor.rotation.x = - Math.PI * 0.5
floor.position.y = -12.5
scene.add(floor)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = -50
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias:true,
   
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
env.encoding = THREE.sRGBEncoding
renderer.toneMappingExposure = 2
renderer.setClearColor('black')
gui.add(renderer,'toneMapping',{
    No:THREE.NoToneMapping,
    Linaer:THREE.LinearToneMapping,
    Reinhard:THREE.ReinhardToneMapping,
    cineon:THREE.CineonToneMapping,
    ACESFilmicg:THREE.ACESFilmicToneMapping,
})
const fog = new THREE.Fog('black',45,100)
scene.fog = fog
/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

const colorButtons = document.querySelectorAll('button');
colorButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const color = event.target.getAttribute('data-color');
        changeCarPaintColor(color);
    });
});