window.onload = function() {
    "use strict";
    
    var container = document.getElementById("logo");
    var sceneWidth = 1180;
    var sceneHeight = 150;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 1, 10000);
    var renderer = new THREE.CanvasRenderer();
    var theText = "NulloY!";
    var text3d = new THREE.TextGeometry(theText, {
		size: 160,
		height: 20,
		curveSegments: 8,
		font: "helvetiker"

	});
	var textMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
//	    overdraw: true
    });
	var parent = new THREE.Object3D();
    
    camera.position.set(0, 150, 500);
    text3d.computeBoundingBox();
    
    var centerOffset = -0.5 * (text3d.boundingBox.max.x - text3d.boundingBox.min.x);
    var text = new THREE.Mesh(text3d, textMaterial);
    
    text.position.x = centerOffset;
	text.position.y = 100;
	text.position.z = 0;

	text.rotation.x = 0;
	text.rotation.y = Math.PI * 2;
	
	parent.add(text);
	scene.add(parent);
	renderer.setSize(sceneWidth, sceneHeight);
	container.appendChild(renderer.domElement);
	
	function render() {
	    parent.rotation.y += 0.01;
	    renderer.render(scene, camera);
	    requestAnimationFrame(render);
	}
	
	render();
};
