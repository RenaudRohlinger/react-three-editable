import { Object3D, Event } from 'three';
import React, { forwardRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { ReactThreeFiber, useThree, Overwrite } from 'react-three-fiber';
import { TransformControls as TransformControlsImpl } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from '@react-three/drei';

type R3fTransformControls = Overwrite<
  ReactThreeFiber.Object3DNode<
    TransformControlsImpl,
    typeof TransformControlsImpl
  >,
  { target?: ReactThreeFiber.Vector3 }
>;

export interface TransformControlsProps extends R3fTransformControls {
  object: Object3D;
  orbitControlsRef?: React.MutableRefObject<OrbitControls | undefined>;
  onObjectChange?: (event: Event) => void;
}

const TransformControls = forwardRef(
  (
    {
      children,
      object,
      orbitControlsRef,
      onObjectChange,
      ...props
    }: TransformControlsProps,
    ref
  ) => {
    const { camera, gl, invalidate } = useThree();
    const controls = useMemo(
      () => new TransformControlsImpl(camera, gl.domElement),
      [camera, gl.domElement]
    );

    useLayoutEffect(() => void controls.attach(object), [object, controls]);

    useEffect(() => {
      controls?.addEventListener?.('change', invalidate);
      return () => controls?.removeEventListener?.('change', invalidate);
    }, [controls, invalidate]);

    useEffect(() => {
      const callback = (event: Event) => {
        if (orbitControlsRef && orbitControlsRef.current) {
          orbitControlsRef.current.enabled = !event.value;
        }
      };

      if (controls) {
        controls.addEventListener!('dragging-changed', callback);
      }

      return () => {
        controls.removeEventListener!('dragging-changed', callback);
      };
    });

    useEffect(() => {
      if (onObjectChange) {
        controls.addEventListener('objectChange', onObjectChange);
      }

      return () => {
        if (onObjectChange) {
          controls.removeEventListener('objectChange', onObjectChange);
        }
      };
    }, [onObjectChange]);

    return <primitive dispose={null} object={controls} ref={ref} {...props} />;
  }
);

export default TransformControls;