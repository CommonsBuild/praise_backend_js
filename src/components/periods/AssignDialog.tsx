import { PoolRequirements } from "@/model/periods";
import {
  faCalculator,
  faCheckSquare,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";
import React from "react";

interface PeriodAssignDialogProps {
  onClose(): any;
  onAssign(): any;
  poolRequirements: PoolRequirements | undefined;
}
const PeriodAssignDialog = ({
  onClose,
  onAssign,
  poolRequirements,
}: PeriodAssignDialogProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faCalculator} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            Assign quantifiers
          </Dialog.Title>
          <div className="text-center mb-7">
            <div>
              The quantifier pool has{" "}
              {poolRequirements ? poolRequirements.quantifierPoolSize : "#"}{" "}
              members.
            </div>
            <div>
              Members needed for quantification:{" "}
              {poolRequirements ? poolRequirements.requiredPoolSize : "#"}
            </div>
            <div>
              <FontAwesomeIcon className="text-green" icon={faCheckSquare} />{" "}
              Quantifier pool requirements are met.
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="mt-4 praise-button"
              onClick={() => {
                onAssign();
                onClose();
              }}
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodAssignDialog;
