"use client";
import { useEffect, useState } from "react";
import { Input } from "@components/ui/input";
import DetailModal from "@components/modal";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import ReusableTable from "@components/table";
import { useRouter } from "next/navigation";
import { disableUser } from "@services/user";
import { convertEnumToMap } from "@utils/enumToMap";
import { USER_TYPE } from "../../types/enum.type";
import Filter from "@components/filter";
import { loadData } from "./fechData";
import { User } from "../../__generated__/graphql";
import { formatDate } from "../../utils/timeFormat";

// type User = {
//   id: number;
//   staffCode: string;
//   fullName: string;
//   username: string;
//   joinedDate: string;
//   type: string;
//   dateOfBirth?: string;
//   gender?: string;
//   location?: string;
// };

interface FormData {
  id: string;
}

const userColumns = [
  { header: "Staff Code", accessor: "staffCode" as keyof User },
  { header: "Full Name", accessor: "fullName" as keyof User },
  { header: "Username", accessor: "username" as keyof User },
  { header: "Joined Date", accessor: "joinedAt" as keyof User },
  { header: "Type", accessor: "type" as keyof User },
];

const UserManagement: React.FC = () => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showModalRemoveUser, setShowModalRemoveUser] = useState(false);
  const [showModalDetailUser, setShowModalDetailUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [listUser, setListUsers] = useState<User[] | []>();
  const router = useRouter();

  useEffect(() => {
    loadUserList();
  }, []);

  const loadUserList = async () => {
    const { data }: any = await loadData({
      page: 1,
    });
    const listUserCustome = data?.map(
      (item: { lastName: any; firstName: any; joinedDate: any, dateOfBirth: any }) => ({
        ...item,
        fullName: `${item.lastName} ${item.firstName}`,
        dob: formatDate(new Date(item.dateOfBirth)),
        joinedAt: formatDate(new Date(item.joinedDate))
      })
    );
    setListUsers(listUserCustome);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowModalRemoveUser(true);
  };

  const handleCloseModal = () => {
    setShowModalRemoveUser(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await onSubmit({ id: selectedUser.id });
    }
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setShowModalDetailUser(true);
  };

  const handleCloseDetailModal = () => {
    setShowModalDetailUser(false);
  };

  const handleNavigateCreateUser = () => {
    router.push("user/create");
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await disableUser(data.id);
      console.log("Response disable: ", response);

      if (response.errors) {
        response.errors.forEach((error: any) => {
          console.error(`GraphQL error message: ${error.message}`);
        });
      } else {
        console.log("User disabled successfully:", response);
        setShowModalRemoveUser(false);
        // Optionally, refresh the user list or navigate
      }
    } catch (error) {
      console.error("Error disabling user:", error);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-nashtech">User List</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Filter label="Type" data={convertEnumToMap(USER_TYPE)} />
            </div>
          </div>
          <div className="flex gap-10">
            <div className="flex items-center border rounded">
              <Input
                type="text"
                placeholder="Search"
                className="border-none focus:ring-0 pr-2"
              />
              <div className="border-l h-9 mx-2"></div>
              <SearchIcon />
            </div>
            <button
              className="bg-red-600 text-white rounded px-4 py-2 cursor-pointer"
              onClick={handleNavigateCreateUser}>
              Create new user
            </button>
          </div>
        </div>
        <ReusableTable
          columns={userColumns}
          data={listUser ?? []}
          onRowClick={handleRowClick}
          onDeleteClick={handleDeleteClick}
        />
        <nav aria-label="Page navigation example" className="mt-4">
          <ul className="flex -space-x-px text-sm justify-end">
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 border border-gray rounded-l-md hover:bg-gray-100 hover:text-gray-700 py-4">
                Previous
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight text-nashtech border-gray border hover:bg-gray-100 hover:text-gray-700 py-4">
                1
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight text-nashtech border-gray border hover:bg-gray-100 hover:text-gray-700 py-4">
                2
              </a>
            </li>
            <li>
              <a
                href="#"
                aria-current="page"
                className="bg-red-600 flex items-center justify-center px-3 h-8 text-white border-gray border hover:bg-red-700 py-4">
                3
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight text-nashtech border border-gray rounded-r-md hover:bg-gray-100 hover:text-gray-700 py-4">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <DetailModal
        isOpen={showModalRemoveUser}
        onClose={handleCloseModal}
        title="Are you sure">
        <div className="bg-white sm:p-6 sm:pb-4 !pt-0">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <p className="text-md text-gray-500">
                Do you want to disable this user?
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 sm:flex sm:flex-row-reverse gap-4">
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={() => setShowModalRemoveUser(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
            onClick={handleConfirmDelete}>
            Disable
          </button>
        </div>
      </DetailModal>
      {selectedUser && (
        <DetailModal
          isOpen={showModalDetailUser}
          onClose={handleCloseDetailModal}
          title="Detailed User Information">
          <div className="text-gray">
            <div className="flex mb-2">
              <span className="text-sm w-40">Staff Code:</span>{" "}
              <span className="text-sm">{selectedUser.staffCode}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-sm w-40">Full Name:</span>{" "}
              <span className="text-sm">
                {selectedUser.lastName} {selectedUser.firstName}
              </span>
            </div>
            <div className="flex mb-2">
              <span className="text-sm w-40">Username:</span>{" "}
              <span className="text-sm">{selectedUser.username}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-sm w-40">Date of Birth:</span>{" "}
              <span className="text-sm">{selectedUser.dateOfBirth}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-sm w-40">Gender:</span>{" "}
              <span className="text-sm">{selectedUser.gender}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-sm w-40">Joined Date:</span>{" "}
              <span className="text-sm">{selectedUser.joinedDate}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-sm w-40">Type:</span>{" "}
              <span className="text-sm">{selectedUser.type}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-sm w-40">Location:</span>{" "}
              <span className="text-sm">{selectedUser.location}</span>
            </div>
          </div>
        </DetailModal>
      )}
    </>
  );
};

export default UserManagement;
