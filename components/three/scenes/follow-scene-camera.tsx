"use client";
import {useEffect,useMemo,useRef,type RefObject} from "react";
import {useFrame,useThree} from "@react-three/fiber";
import {PerspectiveCamera,Vector3} from "three";
import {markCameraReady} from "@/components/three/ufo/lunar-launch.mjs";
import {getProjectileTarget} from "@/components/three/ufo/projectile-collision.mjs";
import {useSceneZoom} from "@/hooks/use-scene-zoom";
import {createScrollTour,createTourAnchors,keepTourCameraClearance} from "@/components/three/animation/scroll-tour.mjs";
import {useScrollTour} from "@/hooks/use-scroll-tour";
import {createFollowCameraScratch,followCameraPose,keepCameraOutsideEarth,keepCameraOutsideShip,orientFollowCamera} from "@/components/three/animation/follow-camera.mjs";
export function FollowSceneCamera({piloting,targetRef,headingRef,upRef,ready,reducedMotion,zoomSteps,zoomReset,launchCameraReady}:{launchCameraReady?:RefObject<boolean>;piloting:boolean;targetRef:RefObject<Vector3>;headingRef:RefObject<Vector3>;upRef?:RefObject<Vector3>;ready:boolean;reducedMotion:boolean;zoomSteps:number;zoomReset:number}){
 const canvas=useThree(s=>s.gl.domElement),invalidate=useThree(s=>s.invalidate),aspect=useThree(s=>s.size.width/Math.max(1,s.size.height));
 const readyRef=useRef(ready&&piloting),tourReadyRef=useRef(ready&&!piloting),tourPosition=useRef(0);
 const tour=useMemo(()=>createScrollTour(),[]);
 const tourAnchors=useRef(createTourAnchors());
 const aim=useRef(new Vector3(0,.35,-9));
 const follow=useMemo(()=>createFollowCameraScratch(),[]),worldUp=useMemo(()=>new Vector3(0,1,0),[]);
 useEffect(()=>{markCameraReady(launchCameraReady,false);readyRef.current=ready&&piloting;tourReadyRef.current=ready&&!piloting;invalidate();},[ready,piloting,invalidate,launchCameraReady]);
 const zoom=useSceneZoom(canvas,readyRef,zoomSteps,zoomReset,invalidate,piloting);
 const tourProgress=useScrollTour(canvas,tourReadyRef,zoomSteps,zoomReset,invalidate,ready&&!piloting);
 useFrame((scene,delta)=>{
  const anchors=tourAnchors.current;
  let earthGone=false;scene.scene.traverse(object=>{
   const target=getProjectileTarget(object);if(target?.foundation>2&&target.planetPhase()!=="intact")earthGone=true;
   if(!piloting){
    if(object.name==="tour-jake"&&object.visible&&object.userData.tourFocus){object.updateWorldMatrix(true,false);anchors.jake.copy(object.userData.tourFocus).applyMatrix4(object.matrixWorld);if(object.userData.tourSpaceFocus)anchors.space.copy(object.userData.tourSpaceFocus).applyMatrix4(object.matrixWorld);}
    if(object.name==="tour-california")object.getWorldPosition(anchors.california);
    if(object.name==="tour-moon"){object.getWorldPosition(anchors.moon);anchors.moonRadius=.82*object.matrixWorld.getMaxScaleOnAxis();}
   }
  });
  if(!piloting)tourPosition.current=reducedMotion?tourProgress.current:tourPosition.current+(tourProgress.current-tourPosition.current)*(1-Math.exp(-5*Math.min(delta,.1)));
  const radius=earthGone?0:Math.min(6.5,aspect*9.4);anchors.earthRadius=radius;
  const pose=piloting?followCameraPose(targetRef.current,zoom.current,radius,headingRef.current,upRef?.current??worldUp,follow):tour.sample(tourPosition.current,anchors);
  const amount=reducedMotion?1:1-Math.exp(-4*Math.min(delta,.1));
  scene.camera.position.lerp(pose.position,amount);aim.current.lerp(pose.target,amount);
  keepCameraOutsideEarth(scene.camera.position,radius);
  if(!piloting)keepTourCameraClearance(scene.camera.position,anchors);
  if(piloting)keepCameraOutsideShip(scene.camera.position,targetRef.current,headingRef.current,radius);
  orientFollowCamera(scene.camera,aim.current,piloting?follow.up:worldUp,reducedMotion?1:1-Math.exp(-4*Math.min(delta,.1)),follow);
  if(piloting&&launchCameraReady&&!launchCameraReady.current&&scene.camera.position.distanceToSquared(pose.position)<.64&&aim.current.distanceToSquared(pose.target)<.16)markCameraReady(launchCameraReady,true);
  if(scene.camera instanceof PerspectiveCamera&&scene.camera.fov!==40){scene.camera.fov=40;scene.camera.updateProjectionMatrix();}
  scene.camera.updateMatrixWorld();
  if(piloting||Math.abs(tourPosition.current-tourProgress.current)>.00001||scene.camera.position.distanceToSquared(pose.position)>.00001||aim.current.distanceToSquared(pose.target)>.00001)scene.invalidate();
 },-.5);
 return null;
}
