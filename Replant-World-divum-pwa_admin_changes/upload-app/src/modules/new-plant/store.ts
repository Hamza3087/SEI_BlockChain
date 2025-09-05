import { FmtMsgFn } from 'modules/intl';
import { CapturedImage } from 'modules/plants';
import { openSnackbar } from 'modules/snackbar';
import { AssignedSpecies } from 'modules/species';
import { create } from 'zustand';

type NewPlantState = {
  image?: CapturedImage;
  imageError?: string;
  isCameraLoading?: boolean;
  isCaptureModalOpen?: boolean;
  isGettingLocation?: boolean;
  stream?: MediaStream;
  species?: AssignedSpecies;
  speciesError?: string;
  tmpImage?: CapturedImage;
  cameraPermissionDenied?: boolean;
  closeCapture: () => void;
  openCapture: (fmtMsg: FmtMsgFn) => void;
  reset: () => void;
  setImage: (value?: CapturedImage) => void;
  setImageError: (value?: string) => void;
  setIsGettingLocation: (value: boolean) => void;
  setSpecies: (value?: AssignedSpecies) => void;
  setSpeciesError: (value?: string) => void;
  setTmpImage: (value?: CapturedImage) => void;
  setCameraPermissionDenied: (value: boolean) => void;
  setStream: (stream?: MediaStream) => void;
};

export const useNewPlantStore = create<NewPlantState>()((set, get) => ({
  closeCapture: () => {
    set({ isCaptureModalOpen: false });
    const stream = get().stream;
    if (!stream) {
      return;
    }
    stopStream(stream);
  },
  openCapture: async (fmtMsg: FmtMsgFn) => {
    // If camera permission is already denied, don't proceed
    if (get().cameraPermissionDenied) {
      return;
    }
    if (!window.navigator.mediaDevices) {
      openSnackbar(fmtMsg('mediaDevicesNotFound'), 'error');
      return;
    }
    set({
      isCameraLoading: true,
      isCaptureModalOpen: true,
      tmpImage: undefined,
    });
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: isPortrait ? 1280 : 960 },
          height: { ideal: isPortrait ? 960 : 1280 },
        },
      });
      set({ isCameraLoading: false });
      // if capture modal has been closed before camera fully started, then close the camera
      if (!get().isCaptureModalOpen) {
        stopStream(stream);
        return;
      }
      set({ stream });
    } catch (e) {
      // if capture modal has been closed before camera error, then don't show error
      if (get().isCaptureModalOpen) {
        openSnackbar(
          fmtMsg('failedToOpenCamera', { error: String(e) }),
          'error'
        );
      }
      // Set camera permission denied state if the error is due to permission denial
      if (e instanceof DOMException && e.name === 'NotAllowedError') {
        set({ cameraPermissionDenied: true });
      }
      set({ isCameraLoading: false, isCaptureModalOpen: false });
    }
  },
  reset: () =>
    set({
      image: undefined,
      imageError: undefined,
      isCameraLoading: undefined,
      isCaptureModalOpen: undefined,
      isGettingLocation: undefined,
      stream: undefined,
      species: undefined,
      speciesError: undefined,
      tmpImage: undefined,
      cameraPermissionDenied: false,
    }),
  setImage: (image) => set({ image, imageError: undefined }),
  setImageError: (imageError) => set({ imageError }),
  setIsGettingLocation: (value: boolean) => set({ isGettingLocation: value }),
  setSpecies: (species) => set({ species, speciesError: undefined }),
  setSpeciesError: (speciesError) => set({ speciesError }),
  setTmpImage: (tmpImage) => set({ tmpImage }),
  setCameraPermissionDenied: (value: boolean) =>
    set({ cameraPermissionDenied: value }),
  setStream: (stream) => set({ stream }), // Add this
}));

const stopStream = (stream: MediaStream) =>
  stream.getVideoTracks().forEach((track) => {
    track.stop();
  });
