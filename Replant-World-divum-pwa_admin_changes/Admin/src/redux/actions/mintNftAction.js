import {
  MINT_NFT_REQUEST,
  MINT_NFT_SUCCESS,
  MINT_NFT_FAILURE,
  RESET_MINT_NFT
} from '../constants/actionTypes';
import { DASHBOARD } from '../../apiConstants/constant';
import { showToast } from '../../components/ToastNotification';
import api from '../../apiConstants/axiosConfig';

export const mintNft = (treeIds) => {
  return async (dispatch) => {
    dispatch({ type: MINT_NFT_REQUEST });

    try {
      const response = await api.post(`${DASHBOARD.MINT_NFT}`, {
        tree_ids: treeIds
      });

      dispatch({
        type: MINT_NFT_SUCCESS,
        payload: response
      });
      showToast.success(
        response?.message || 'Trees marked for NFT minting successfully!'
      );
      setTimeout(() => {
        dispatch({ type: RESET_MINT_NFT });
      }, 3000);
      return response;
    } catch (error) {
      const errorMessage = error?.message;
      let displayMessage = 'Failed to mint NFT for trees';

      // Handle different error message formats
      if (typeof errorMessage === 'string') {
        displayMessage = errorMessage;
      } else if (typeof errorMessage === 'object') {
        // Handle object-style messages (like your example)
        displayMessage = Object.values(errorMessage).flat().join(', ');
      }

      dispatch({
        type: MINT_NFT_FAILURE,
        payload: error?.response?.data || { message: displayMessage }
      });
      showToast.error(displayMessage);
      setTimeout(() => {
        dispatch({ type: RESET_MINT_NFT });
      }, 3000);

      throw error;
    }
  };
};

export const resetMintNft = () => ({
  type: RESET_MINT_NFT
});
