import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import JSONEditor from "jsoneditor";
import Viewer from "viewerjs";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


type FileRef = firebase.storage.Reference;
const db = firebase.firestore();
const storage = firebase.storage();

export class Mkeditor {
  public editorDivElement: HTMLDivElement;
  private editorElement: HTMLDivElement;
  private editor: JSONEditor;
  private updateBtn: HTMLButtonElement;
  public btnBoxDiv: HTMLDivElement;
  public makeActiveBtn: HTMLButtonElement;
  private activeFile: 
    { loc: string, id: string | FileRef };
  
  fileNameP: HTMLParagraphElement;

  constructor() {
    this.editorDivElement 
      = document.querySelector("#editor-div") as HTMLDivElement;
    this.editorElement = document.querySelector("#editor") as HTMLDivElement;
    this.editor = new JSONEditor(this.editorElement);
    this.updateBtn = document.querySelector("#update-btn") as HTMLButtonElement;
    this.btnBoxDiv = document.querySelector("#button-box") as HTMLDivElement;
    this.makeActiveBtn = document.querySelector("#active-btn") as HTMLButtonElement;
    this.activeFile = { loc: "", id: "" };
    this.updateBtnAction();
    this.makeActiveBtnAction();
    this.fileNameP = 
    document.querySelector("#file-name-span") as HTMLParagraphElement;
  }

  public displayFirebaseTextFile(file: Object, loc: string) {
    try {
      this.editor.destroy();
      this.editor = new JSONEditor(this.editorElement, {}, file);
      this.trackFirebaseActiveFile(loc, file);
    } catch (error) {
      console.error("JSONEditor Error:", error);
    }
  }

  private trackFirebaseActiveFile(loc: string, file: any) {
    if (loc === "marmosets") {
      this.activeFile = { loc: loc, id: file.name };
      this.fileNameP.innerText = String(this.activeFile.id);
    }

    else if (loc === "mkturkdata") {
      if (file.Doctype === "task") {
        this.activeFile = { loc: loc, id: file.Taskdoc };
        this.fileNameP.innerText = String(this.activeFile.id);
      } else if (file.Doctype === "images") {
        this.activeFile = { loc: loc, id: file.Imagesdoc};
        this.fileNameP.innerText = String(this.activeFile.id);
      }
    }

    else if (loc === "objects") {
      this.activeFile = { loc: loc, id: file.docname };
      this.fileNameP.innerText = String(this.activeFile.id);
    }

    else if (loc === "eyecalibrations") {
      this.activeFile = { loc: loc, id: file.Docname };
      this.fileNameP.innerText = String(this.activeFile.id);
    }

    else if (loc === "devices") {
      this.activeFile = { loc: loc, id: file.docname };
      this.fileNameP.innerText = String(this.activeFile.id);
    }

    else if (loc === "mkscale") {
      this.activeFile = { loc: loc, id: file.Docname };
      this.fileNameP.innerText = String(this.activeFile.id);
    }

    console.log("activeFile", this.activeFile);
  }

  public async displayStorageTextFile(fileRef: FileRef) {
    let fileUrl = await fileRef.getDownloadURL().catch(e => {
      console.error("Error getting download URL", e);
    });

    let response = await fetch(fileUrl);
    let file = await response.json();

    this.editor.destroy();
    this.editor = new JSONEditor(this.editorElement, {}, file);
    this.activeFile = { loc: "mkturkfiles", id: fileRef };
    console.log("activeFile", this.activeFile);
    this.fileNameP.innerText = fileRef.name;
  }

  private updateBtnAction() {
    this.updateBtn.addEventListener("click" || "pointerup", (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
      let loc = this.activeFile.loc;      

      if (loc === "marmosets" || loc === "mkturkdata") {
        // handle marmosets && mkturkdata
        let id = this.activeFile.id as string;
        db.collection(loc).doc(id).set(
          this.dateToTimestamp(this.editor.get())
        ).then(() => {
          console.log("[DOCUMENT UPDATED]:", id);
          alert("Document Updated");
        }).catch(e => {
          console.error("[DOCUMENT UPDATE FAILED]", "FILE:", id, "ERROR:", e);
          alert("Document Update Failed");
        });
      }

      else if (this.activeFile.loc === "mkturkfiles") {
        // handle mkturkfiles
        let id = this.activeFile.id as FileRef;
        let updatedFile = new Blob([ JSON.stringify(this.editor.get(), null, 1) ]);
        let metadata = {
          contentType: "application/json"
        };
        id.put(updatedFile, metadata).then(snapshot => {
          console.log("[DOCUMENT UPDATED]:", snapshot.metadata.name);
          alert("Document Updated")
        }).catch(e => {
          console.error("[DOCUMENT UPDATE FAILED]", "FILE:", id, "ERROR:", e);
          alert("Document Update Failed");
        });
      }

      else {
        console.error("[DOCUMENT UPDATE FAILED] ERROR: Location Error");
      }
    });
  }

  private makeActiveBtnAction() {
    this.makeActiveBtn.addEventListener('click' || 'pointerup', (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
      console.log(this.activeFile);
      let storageRef = storage.ref();
      let file = this.editor.get();
      let fileName = "mkturkfiles/parameterfiles/subjects/" + file.Agent + "_params.txt";
      let fileRef = storageRef.child(fileName);
      file = new Blob([ JSON.stringify(file, null, 1) ]);
      let metadata = {
        contentType: "application/json"
      };
      fileRef.put(file, metadata).then(snapshot => {
        console.log("[PARAM MADE ACTIVE]:", snapshot.metadata.name);
        alert("Param Active");
      }).catch(e => {
        console.error("[PARAM ACTIVATION FAILED]", "FILE:", fileRef, "ERROR", e);
        alert("Param Activation Failed");
      });
    });
  }

  private dateToTimestamp(data: any) {
    function _dateToTimestamp(element: string, idx: number, arr: any[]) {
      let dt = new Date(element);
      if (!isNaN(Number(dt)) && dt instanceof Date && typeof element === "string") {
        arr[idx] = firebase.firestore.Timestamp.fromDate(dt);
      }
    }

    for (let key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        console.log("ARRAY " + "data[" + key + "]" + "=" + data[key]);
        data[key].forEach(_dateToTimestamp);
      }

      else if (this.isDict(data[key])) {
        for (let key2 of Object.keys(data[key])) {
          let dt = new Date(data[key][key2]);
          if (!isNaN(Number(dt)) && dt instanceof Date && this.isString(data[key][key2])) {
            console.log("Dictionary " + "data[" + key + "]" + "=" + data[key]);
            data[key][key2] = firebase.firestore.Timestamp.fromDate(dt);
          }
        }
      }

      else if (this.isString(data[key])) {
        let dt = new Date(data[key]);
        if (!isNaN(Number(dt)) && dt instanceof Date) {
          data[key] = firebase.firestore.Timestamp.fromDate(dt);
        }
      }
    }
    return data;
  }

  private isDict(val: any) {
    return val && typeof val === "object" && val.constructor === Object;
  }

  private isString(val: any) {
    return typeof val === "string" || val.constructor === String;
  }
  
}

export class Mkthree {

  /* THREE.js member variables */
  private scene: THREE.Scene | null;
  private camera: THREE.PerspectiveCamera | null;
  private cameraPos: THREE.Vector3 | null;
  private controls: OrbitControls | null;
  private dirLight: THREE.DirectionalLight | null;
  private dirLightPos: THREE.Vector3 | null;
  private light: THREE.AmbientLight | null;
  private loader: GLTFLoader | null;
  private renderer: THREE.WebGLRenderer | null;
  public animationID: number;
  public active: boolean;

  public canvas: HTMLCanvasElement;
  
  /* constructor */
  constructor() {
    this.scene = null;
    this.camera = null;
    this.cameraPos = null;
    this.controls = null;
    this.dirLight = null;
    this.dirLightPos = null;
    this.light = null;
    this.loader = null;
    this.renderer = null;
    this.animationID = -1;
    this.active = false;
    this.canvas = document.querySelector("#three-canvas") as HTMLCanvasElement;
    let editorDiv = document.querySelector("#editor-div") as HTMLDivElement;
    this.canvas.width = editorDiv.offsetWidth;
    this.canvas.height = editorDiv.offsetHeight;
    this.canvas.style.width = String(editorDiv.offsetWidth);
    this.canvas.style.height = String(editorDiv.offsetHeight);
    this.resizeCanvasAction();
  }

  /**
   * Public function to display mesh specified by filepath to a canvas
   * specified by canvas
   * 
   * @param {string} filePath
   * @param {HTMLCanvasElement} canvas
   * @public
   */
  public async displayMesh(meshRef: firebase.storage.Reference) {
    console.time("displayMesh()");

    if (this.active) {
      this.destroy();
    }

    /* renderer setup */
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setClearColor( 0xFFFFFF );
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMappingExposure = 10;
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;

    /* camera setup */
    this.cameraPos = new THREE.Vector3( 0, 0, 10 );
    this.camera = 
      new THREE.PerspectiveCamera( 45, this.canvas.width / this.canvas.height, 0.1, 2000 );
    this.camera.position.set( this.cameraPos.x, this.cameraPos.y, this.cameraPos.z );

    /* light setup */
    this.dirLightPos = new THREE.Vector3( 0, 2, 0 );
    this.dirLight = new THREE.DirectionalLight( 0xFFFFFF, 0.5);
    this.dirLight.position.set( this.dirLightPos.x, this.dirLightPos.y, this.dirLightPos.z )
    this.light = new THREE.AmbientLight( 0x404040, 0.05 ); // (0x404040, 0.1)

    /* control setup */
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target = new THREE.Vector3( 0, 0, 0);

    /* scene setup */
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.scene.add(this.dirLight);
    this.scene.add(this.light);

    /* load mesh */
    let objectMesh: any = await this.loadMesh(meshRef);

    /* add loaded mesh to scene */
    this.scene.add(objectMesh.scene)
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.active = true;

    console.timeEnd("displayMesh()")
  }

  /**
   * Private function to load and return mesh specified by filepath 
   * 
   * @param {string} filePath
   * @returns {Promise}
   * @private
   */
  private async loadMesh(meshRef: firebase.storage.Reference) {
    
    try {
      let meshUrl = await meshRef.getDownloadURL().catch(e => {
        console.error("Error:", e);
      });

      this.loader = new GLTFLoader();

      return new Promise((resolve, reject) => {
        try {
          this.loader?.load(meshUrl, function(gltf) {
            gltf.scene.traverse((child: any) => {
              if (child.material) {
                //let material = new THREE.MeshPhongMaterial({ color: 0xFF0000, map: child.material.map });
                let material = new THREE.MeshPhongMaterial({ color: "#FFE0BD" })
                if ("morphTargetInfluences" in child) {
                  material.morphTargets = true;
                }
                child.material = material;
                child.material.needsUpdate = true;
              }
            });
            resolve(gltf);
          });
        } catch (error) {
          console.error("Error:", error);
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  private animate() {
    this.animationID = requestAnimationFrame(this.animate.bind(this));
    if (this.scene && this.camera) {
      this.renderer?.render(this.scene, this.camera);
    }
  }

  public destroy() {
    try {
      this.scene = null;
      this.camera = null;
      this.cameraPos = null;
      this.controls = null;
      this.dirLight = null;
      this.dirLightPos = null;
      this.light = null;
      this.loader = null;
      this.renderer?.clear();
      this.renderer = null;
      this.animationID = -1;
      this.active = false;
      cancelAnimationFrame(this.animationID);
    } catch (error) {
      console.error("Error destroying THREE Objects:", error);
    }
  }

  private resizeCanvasAction() {
    window.addEventListener("resize", (ev: Event) => {
      let editorDiv = document.querySelector("#editor-div") as HTMLDivElement;
      this.canvas.width = editorDiv.offsetWidth;
      this.canvas.height = editorDiv.offsetHeight;
      this.canvas.style.width = String(editorDiv.offsetWidth);
      this.canvas.style.height = String(editorDiv.offsetHeight);
    });
  }
}

export class Mkimage {
  imgCanvasDiv: HTMLDivElement;
  imgCanvas: HTMLElement;
  imgGallery: Viewer;

  constructor() {
    this.imgCanvasDiv = 
    document.querySelector("#image-canvas-div") as HTMLDivElement;

    this.imgCanvas =
    document.querySelector("#image-canvas") as HTMLElement;

    this.imgGallery = 
    new Viewer(document.getElementById("image-canvas")!);
  }

  public async displayImage(fileRef: FileRef, fileName: string) {
    let li = document.createElement("li");
    li.setAttribute("class", "imageList");
    let imgDiv = document.createElement("div");
    let img = document.createElement("img");
    let imgLabel = document.createElement("p");
    imgLabel.innerHTML = fileName;
    await fileRef.getDownloadURL().then(url => {
      img.src = url;
    });

    imgDiv.appendChild(img);
    imgDiv.appendChild(imgLabel);
    li.appendChild(imgDiv);
    this.imgCanvas.appendChild(li);
    this.imgGallery.destroy();
    this.imgGallery = new Viewer(document.getElementById("image-canvas")!);
  }

  public removeImages() {
    let elements = document.getElementsByClassName("imageList");
    while (elements.length > 0) {
      elements[0].parentNode?.removeChild(elements[0]);
    }
    
  }
}

export class Mkchart {
  chartDiv: HTMLDivElement;
  plotX: HTMLSelectElement;
  plotY: HTMLSelectElement;
  plotBtn: HTMLButtonElement;
  finderDiv: HTMLDivElement;
  chart: any;
  data: any;
  isActive: boolean;

  constructor() {
    google.charts.load('current', { packages: ['corechart'] });
    this.chartDiv = document.querySelector("#chart-div") as HTMLDivElement;
    this.finderDiv = document.querySelector("#finder-div") as HTMLDivElement;
    this.plotX = document.querySelector("#quick-plot-x") as HTMLSelectElement;
    this.plotY = document.querySelector("#quick-plot-y") as HTMLSelectElement;
    this.plotBtn = document.querySelector("#plot-btn") as HTMLButtonElement;
    this.isActive = false;
    
    this.data = null;
    console.log(this.chartDiv);
    
    this.plotBtnAction();
    //this.closeCanvas();

    
  }

  public plotBtnAction() {
    this.plotBtn.addEventListener('click', (ev: Event) => {
      ev.preventDefault();
      this.isActive = !this.isActive;
      console.log(this.isActive);
      if (this.isActive) {
        this.plotBtn.textContent = "Close Quick Plot";
        this.chartDiv.style.zIndex = "2";
        this.finderDiv.style.zIndex = "1";
        let vizData = new google.visualization.DataTable();
        vizData.addColumn('datetime', this.plotX.value);
        vizData.addColumn('number', this.plotY.value);
        
        for (let i = 0; i < this.data[this.plotX.value].length; i++) {
          vizData.addRow([ new Date(this.data[this.plotX.value][i]), parseFloat(this.data[this.plotY.value][i]) ]);
        }

        console.log(this.chartDiv.clientWidth);
        let chart = new google.visualization.LineChart(this.chartDiv);
        let options = { title: this.plotY.value, width: this.chartDiv.offsetWidth, height: this.chartDiv.offsetHeight, legend: 'none'};
        chart.draw(vizData, options);
        
      } else {
        this.plotBtn.textContent = "Quick Plot";
        this.finderDiv.style.zIndex = "2";
        this.chartDiv.style.zIndex = "1";

      }
    });

    
  }

  public populateAxisFields(data: any) {
    this.data = data;
    for (let key of Object.keys(data)) {
      if (Array.isArray(data[key]) && key.includes("_dates")) {
        let option = document.createElement("option");
        option.setAttribute("class", "axis-options");
        option.setAttribute("value", key);
        option.textContent = key;
        this.plotX.appendChild(option);
      }
      else if (Array.isArray(data[key]) && key.includes("_values")) {
        let option = document.createElement("option");
        option.setAttribute("class", "axis-options");
        option.setAttribute("value", key);
        option.textContent = key;
        this.plotY.appendChild(option);
      }
    }
  }

  public removeElementsByClassName(cName: string) {
    let elements = document.getElementsByClassName(cName);
    while (elements.length > 0) {
      elements[0].parentNode?.removeChild(elements[0]);
    }
  }
}