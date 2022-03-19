"use strict";
import * as THREE from './three/three.module.js';
import {OrbitControls} from './three/OrbitControls.js';
import { Stats } from './three/stats.module.js'
import { Vector3,Box3 } from './three/three.module.js';

export default class demo{
    constructor(options){
        this.scene = new THREE.Scene();
        this.stats = this.createStats();
        document.body.appendChild( this.stats.domElement );

        this.container3D = options.threeD;
        this.container2D = options.twoD;
        this.twoDWidth = this.container2D.offsetWidth;
        this.twoDHeight = this.container2D.offsetHeight;
        this.width = this.container3D.offsetWidth;
        this.height = this.container3D.offsetHeight;
        this.camera = new THREE.PerspectiveCamera( 70, 
            this.width / this.height, 0.01, 50 );
        this.camera.position.z = 8.8;
        this.camera.position.y = 0.4;

        this.renderer = new THREE.WebGLRenderer( { antialias: false } );
        this.renderer.setSize( this.width, this.height );
        this.container3D.appendChild( this.renderer.domElement );
        this.setupResize();
        this.ground();
        this.init2D();
    }

    init2D(){

        // first we need to create a stage
        this.stage = new Konva.Stage({
            container: this.container2D,  
            width: this.twoDWidth,
            height: this.twoDHeight
        });
        
        // then create layer
        this.layer = new Konva.Layer();
        
        // create our shape
        this.circle = new Konva.Circle({
            x: this.stage.width() / 2,
            y: this.stage.height() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });
        this.sphere(this.circle.attrs.x,this.circle.attrs.y);
        
       this.circle.on('xChange', (function() {
            this.sphereMesh.position.x = this.circle.attrs.x*(10./this.twoDWidth)-5.0;
            this.sphereMesh.position.z = this.circle.attrs.y*(10./this.twoDHeight)-5.0;
            this.sphereMesh.position.y = 0.1;        
            this.sphereMesh.rotateAroundWorldAxis(new Vector3(0, 0, 0),new Vector3(1, 0, 0),Math.PI / 4.);    
        }).bind(this));
              
        // add the shape to the layer
        this.layer.add(this.circle);
        
        // add the layer to the stage
        this.stage.add(this.layer);
        
        // draw the image
        this.layer.draw();
    }

    setupResize(){
        window.addEventListener('resize',this.resize.bind(this));
    }

    resize(){
        this.width = this.container3D.offsetWidth;
        this.height = this.container3D.offsetHeight;
        this.renderer.setSize( this.width, this.height );
        this.camera.aspect = this.width/this.height;
        this.camera.updateProjectionMatrix(); 
        this.twoDWidth = this.container2D.offsetWidth;
        this.twoDHeight = this.container2D.offsetHeight;
        this.stage.attrs.x = this.twoDWidth;
        this.stage.attrs.x = this.twoDHeight;
        this.layer.draw();
    }

    render2(){
        var time =Date.now();
        this.renderer.render( this.scene, this.camera );
        window.requestAnimationFrame(this.render2.bind(this))
        this.stats.update();
    }

    createStats = () => {
        var stats = new Stats();
        stats.setMode(0);
  
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0';
        stats.domElement.style.top = '0';
  
        return stats;
    }

    ground = () => {        
        let groundGeo = new THREE.PlaneBufferGeometry( 10,10,50,50);
        let groundMat = new THREE.MeshBasicMaterial({color: 0x12AB32});

        let groundMesh = new THREE.Mesh( groundGeo, groundMat );
        groundMesh.rotateX(-Math.PI/4);
        //groundMesh.rotateX(-Math.PI/2);
        groundMesh.receiveShadow = true;
        this.scene.add( groundMesh );
        return groundMesh;
    }
    
    sphere = (x,y) => {
        console.log(x,y);
        this.sphereGeo = new THREE.SphereGeometry(0.1);
        this.sphereMat = new THREE.MeshBasicMaterial({color:"red"});
        this.sphereMesh = new THREE.Mesh( this.sphereGeo, this.sphereMat );
        this.sphereMesh.position.x = x*(10./this.twoDWidth)-5.0;
        this.sphereMesh.position.z = y*(10./this.twoDHeight)-5.0;
        this.sphereMesh.position.y = 0.1;        
        this.sphereMesh.rotateAroundWorldAxis(new Vector3(0, 0, 0),new Vector3(1, 0, 0),Math.PI / 4.);
        this.scene.add( this.sphereMesh );
    }
}

THREE.Object3D.prototype.rotateAroundWorldAxis = function() {

    // rotate object around axis in world space (the axis passes through point)
    // axis is assumed to be normalized
    // assumes object does not have a rotated parent

    var q = new THREE.Quaternion();

    return function rotateAroundWorldAxis( point, axis, angle ) {

        q.setFromAxisAngle( axis, angle );

        this.applyQuaternion( q );

        this.position.sub( point );
        this.position.applyQuaternion( q );
        this.position.add( point );

        return this;

    }

}();

let v = new demo({
    threeD: document.getElementById('threeD'),
    twoD: document.getElementById('twoD'),
});
v.render2();
