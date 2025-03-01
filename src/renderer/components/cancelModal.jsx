import React from 'react';
import PropTypes from 'prop-types';
import * as Dialog from '@radix-ui/react-dialog';
import './modalStyle.css';

export const CancelTransferModel = ({ onCancel }) => {

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='bg-gray-600 px-4 py-2 text-white  rounded-md mt-3'>Cancel</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title >Cancel Transfer</Dialog.Title>
          <Dialog.Description className="text-gray-700">
            Are you certain you want to stop the file transfer? Any progress made so far will be lost.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              onClick={onCancel}
              className="hover:bg-red-500   bg-red-700 px-4 py-2 text-white  rounded-md"
            >
              Yes, Cancel Transfer
            </button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <button className="ml-2 hover:bg-gray-500 bg-gray-700 px-4 py-2 text-white  rounded-md" aria-label="Close">
              No, Continue Transfer
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

CancelTransferModel.propTypes = {
  onCancel: PropTypes.func.isRequired,
};

