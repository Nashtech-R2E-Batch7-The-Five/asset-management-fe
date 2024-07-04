import React, { FC, useState } from "react";
import { useLoading } from "@providers/loading";
import { Assignment } from "../../__generated__/graphql";
import { ASSIGNMENT_STATUS, SORT_ORDER } from "../../types/enum.type";
import Paginate from "@components/paginate";
import EmptyComponent from "@components/empty";
import DetailOwnAssignment from "./detail";
import ModalConfirmDeclineAssignment from "./components/modal/confirmDecline";
import ModalConfirmAcceptAssignment from "./components/modal/confirmAccept";
import HomeList from "./components/table/homeList";
import { toast } from "react-toastify";
import { tableColumns } from "./tableColumn";
import { UpdateStatusAssignmentService } from "@services/assignment";

interface ViewAssignmentProps {
  listData: Assignment[];
  sortOrder: SORT_ORDER;
  sortBy: string;
  setSortBy: (value: any) => void;
  setSortOder: (value: any) => void;
  totalPages: number;
  currentPage: number;
  reloadTableData: () => void;
}

const ViewOwnAssignment: FC<ViewAssignmentProps> = (props) => {
  const {
    listData,
    totalPages,
    currentPage,
    setSortBy,
    setSortOder,
    sortOrder,
    sortBy,
    reloadTableData,
  } = props;
  const { setLoading }: any = useLoading();

  const [selected, setSelected] = useState<Assignment>();
  const [showModalDetail, setShowModalDetail] = useState(false);
  const [showModalConfirmDecline, setShowModalConfirmDecline] = useState(false);
  const [showModalConfirmAccept, setShowModalConfirmAccept] = useState(false);

  const handleSortClick = (item: string) => {
    let defaultOrder = SORT_ORDER.ASC;
    if (sortBy === item) {
      defaultOrder =
        sortOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC;
    }
    setSortOder(defaultOrder);
    setSortBy(item);
  };

  const handleRowClick = (ass: Assignment) => {
    setSelected(ass);
    setShowModalDetail(true);
  };

  const handleCloseDetailModal = () => {
    setShowModalDetail(false);
  };

  const handleDeclineAssignment = (ass: Assignment) => {
    setSelected(ass);
    setShowModalConfirmDecline(true);
  };

  const handleAcceptAssignment = (ass: Assignment) => {
    setSelected(ass);
    setShowModalConfirmAccept(true);
  };

  const handleConfirmAccept = async () => {
    if (selected?.id === undefined) {
      toast.error("Selected assignment ID is undefined. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const result = await UpdateStatusAssignmentService({
        state: ASSIGNMENT_STATUS.ACCEPTED,
        id: selected?.id,
      });

      if (result) {
        setShowModalConfirmAccept(false);
        toast.success("Accept Assignment Successfully");
        reloadTableData();
      } else {
        toast.error("Failed to accept the assignment. Please try again.");
      }
    } catch (error: any) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDecline = async () => {
    if (selected?.id === undefined) {
      toast.error("Selected assignment ID is undefined. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const result = await UpdateStatusAssignmentService({
        state: ASSIGNMENT_STATUS.DECLINED,
        id: selected?.id,
      });

      if (result) {
        setShowModalConfirmDecline(false);
        toast.success("Decline Assignment Successfully");
        reloadTableData();
      } else {
        toast.error("Failed to accept the assignment. Please try again.");
      }
    } catch (error: any) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-nashtech">My Assignment</h2>
      <HomeList
        columns={tableColumns}
        data={listData}
        onRowClick={handleRowClick}
        onDeleteClick={handleDeclineAssignment}
        onSortClick={handleSortClick}
        onEditClick={handleAcceptAssignment}
        onReturnClick={() => {}}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
      {listData?.length > 0 ? (
        <Paginate currentPage={currentPage} totalPages={totalPages} />
      ) : (
        <EmptyComponent />
      )}

      {selected && (
        <DetailOwnAssignment
          showModalDetailUser={showModalDetail}
          handleCloseDetailModal={handleCloseDetailModal}
          data={selected}
        />
      )}

      {selected && (
        <ModalConfirmDeclineAssignment
          showModalConfirm={showModalConfirmDecline}
          setShowModalConfirm={setShowModalConfirmDecline}
          handleConfirmDecline={handleConfirmDecline}
        />
      )}

      {selected && (
        <ModalConfirmAcceptAssignment
          showModalConfirm={showModalConfirmAccept}
          setShowModalConfirm={setShowModalConfirmAccept}
          handleConfirmAccept={handleConfirmAccept}
        />
      )}
    </div>
  );
};

export default ViewOwnAssignment;
