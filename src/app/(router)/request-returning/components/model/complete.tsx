import DetailModal from "@components/modal";
import { Button } from "@components/ui/button";
import React, { FC } from "react";
import { ModalConfirmProps } from "./modalProps";

const ModalCompleteRequestReturn: FC<ModalConfirmProps> = (props) => {
  const { showModalConfirm, setShowModalConfirm, handleConfirmComplete } =
    props;

  return (
    <DetailModal
      isOpen={showModalConfirm}
      onClose={() => setShowModalConfirm(false)}
      title="Are you sure ?"
    >
      <div className="bg-white sm:p-6 sm:pb-4">
        <p className="text-md text-gray-500">
          {`Do you want to mark this returning request as 'Completed'?`}
        </p>
      </div>
      <div className="bg-gray-50 sm:flex sm:flex-row-reverse gap-4">
        <Button
          type="button"
          variant="outline"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm text-gray shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          onClick={() => setShowModalConfirm(false)}
        >
          No
        </Button>
        <Button
          type="button"
          onClick={handleConfirmComplete}
          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
        >
          Yes
        </Button>
      </div>
    </DetailModal>
  );
};

export default ModalCompleteRequestReturn;
