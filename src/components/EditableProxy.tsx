import {
  BoxHelper,
  CameraHelper,
  DirectionalLightHelper,
  Object3D,
  PointLightHelper,
  SpotLightHelper,
} from 'three';
import React, { useLayoutEffect, useRef, VFC } from 'react';
import { useHelper, Sphere } from '@react-three/drei';
import { EditableType, useEditorStore } from '../store';
import shallow from 'zustand/shallow';

export interface EditableProxyProps {
  editableName: string;
  editableType: EditableType;
  object: Object3D;
  onChange?: () => void;
}

const EditableProxy: VFC<EditableProxyProps> = ({
  editableName,
  editableType,
  object,
}) => {
  const [selected, setSelected] = useEditorStore(
    (state) => [state.selected, state.setSelected],
    shallow
  );

  // set up helper
  let Helper:
    | typeof SpotLightHelper
    | typeof DirectionalLightHelper
    | typeof PointLightHelper
    | typeof BoxHelper
    | typeof CameraHelper;

  switch (editableType) {
    case 'spotLight':
      Helper = SpotLightHelper;
      break;
    case 'directionalLight':
      Helper = DirectionalLightHelper;
      break;
    case 'pointLight':
      Helper = PointLightHelper;
      break;
    case 'perspectiveCamera':
    case 'orthographicCamera':
      Helper = CameraHelper;
      break;
    case 'group':
    case 'mesh':
      Helper = BoxHelper;
  }

  let helperArgs: [string] | [number, string] | [];
  const size = 1;
  const color = selected === editableName ? 'darkred' : 'darkblue';

  switch (editableType) {
    case 'directionalLight':
    case 'pointLight':
      helperArgs = [size, color];
      break;
    case 'group':
    case 'mesh':
    case 'spotLight':
      helperArgs = [color];
      break;
    case 'perspectiveCamera':
    case 'orthographicCamera':
      helperArgs = [];
  }

  const objectRef = useRef(object);

  useLayoutEffect(() => {
    objectRef.current = object;
  }, [object]);

  useHelper(objectRef, Helper, ...helperArgs);

  return (
    <>
      <group
        onClick={(e) => {
          e.stopPropagation();
          setSelected(editableName);
        }}
      >
        <primitive object={object}>
          {[
            'spotLight',
            'pointLight',
            'directionalLight',
            'perspectiveCamera',
            'orthographicCamera',
          ].includes(editableType) && (
            <Sphere
              args={[2, 4, 2]}
              onClick={() => {
                setSelected(editableName);
              }}
              userData={{ helper: true }}
            >
              <meshBasicMaterial visible={false} />
            </Sphere>
          )}
        </primitive>
      </group>
    </>
  );
};

export default EditableProxy;