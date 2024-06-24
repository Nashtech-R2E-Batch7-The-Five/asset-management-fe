/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z, ZodSchema } from "zod";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { toast } from "react-toastify";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { differenceInYears, isAfter, isWeekend } from "date-fns";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DetailModal from "@components/modal";
import { CREATE_USER_MUTATION } from "@services/user";
import { useMutation } from "@apollo/client";
import { useLoading } from "@providers/loading";
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from "@providers/auth";
import { User } from "../../../__generated__/graphql";

enum Gender {
    Male = "MALE",
    Female = "FEMALE",
    Other = "OTHER",
}

enum Type {
    Admin = "ADMIN",
    Staff = "USER",
}

enum Location {
    HCM = "HCM",
    HN = "HN",
    DN = "DN"
}

const formSchema: ZodSchema = z
    .object({
        firstName: z
            .string()
            .min(1, { message: "First Name is missing" })
            .regex(/^[a-zA-Z0-9_ ]+$/, {
                message: "Must contain alphabetic characters",
            })
            .max(128, {
                message: "First Name can't be more than 128 characters",
            })
            .refine((val) => /[a-zA-Z]/.test(val), {
                message: "First Name is invalid",
            }),
        lastName: z
            .string()
            .min(1, { message: "Last Name is missing" })
            .regex(/^[a-zA-Z0-9_ ]+$/, {
                message: "Must contain only alphabetic characters",
            })
            .max(128, {
                message: "Last Name can't be more than 128 characters",
            })
            .refine((val) => /[a-zA-Z]/.test(val), {
                message: "Last Name is invalid"
            })
        ,
        dateOfBirth: z
            .string()
            .min(1, { message: "Date of birth is missing" })
            .refine(
                (val) => {
                    const date = new Date(val);
                    return differenceInYears(new Date(), date) >= 18;
                },
                { message: "User is under 18. Please select a different date" }
            ),
        gender: z.nativeEnum(Gender, { message: "Gender is missing" }),
        joinedDate: z
            .string()
            .min(1, { message: "Joined Date is missing" })
            .refine(
                (val) => {
                    const date = new Date(val);
                    return !isWeekend(date);
                },
                {
                    message:
                        "Joined date cannot be Saturday or Sunday. Please select a different date",
                }
            ),
        type: z.string().min(1, { message: "Type is missing" }),
        location: z.string().optional()
    })
    .superRefine((values, ctx) => {
        const dobDate = new Date(values.dateOfBirth);
        const joinedDate = new Date(values.joinedDate);

        if (differenceInYears(joinedDate, dobDate) < 18) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Joined date is not later than Date of Birth. Please select a different date",
                path: ["joinedDate"],
            });
        }

        if (isAfter(dobDate, joinedDate)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Joined date is not later than Date of Birth. Please select a different date",
                path: ["joinedDate"],
            });
        }

        if (values.type === Type.Admin && !values.location) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Location is required when Type is Admin",
                path: ["location"],
            });
        }

        if (values.type === Type.Admin && !values.location) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Location is required when Type is Admin",
                path: ["location"],
            });
        }
    });

interface FormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    joinedDate: string;
    type: Type;
    location: Location
}

const CreateAsset = ({ addUserToList }: { addUserToList: (user: User) => void }) => {
    const [createUserMutation] = useMutation(CREATE_USER_MUTATION);
    const { setLoading }: any = useLoading();

    const [showModalCancel, setShowModalCancel] = useState(false);
    const router = useRouter();
    const { setActiveItem } = useAuth();

    useEffect(() => {
        setActiveItem({ name: "Manage User", path: "/user" });
    }, []);

    const handleCloseCancelModal = () => {
        setShowModalCancel(false);
    };

    const handleDiscard = () => {
        form.reset();
        setShowModalCancel(false);
        router.push("/user");
    };

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            gender: Gender.Female,
            joinedDate: "",
            type: Type.Staff,
            location: Location.HCM
        },
    });

    const allFieldsFilled = !!form.watch("firstName") && !!form.watch("lastName") && !!form.watch("dateOfBirth") && !!form.watch("gender") && !!form.watch("joinedDate") && (!!form.watch("location") || form.watch("type") === Type.Staff);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            // Capitalize first name and last name
            const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            const capitalizedFirstName = capitalize(data.firstName);
            const capitalizedLastName = capitalize(data.lastName);

            const variables: any = {
                createUserInput: {
                    firstName: capitalizedFirstName,
                    lastName: capitalizedLastName,
                    gender: data.gender,
                    joinedDate: data.joinedDate,
                    dateOfBirth: data.dateOfBirth,
                    type: data.type,
                    location: data.location
                }
            };

            if (data.type === Type.Admin) {
                variables.createUserInput.location = data.location;
            }

            const response = await createUserMutation({ variables });
            console.log("Response from FE: ", response);

            if (response.errors) {
                response.errors.forEach((error: any) => {
                    console.error(`GraphQL error message: ${error.message}`);
                });
            } else {
                // Save user ID to local storage
                const userId = response.data.createUser.id;
                localStorage.setItem('userId', userId);

                toast.success("Create User Successfully");
                console.log('User created successfully:', response);

                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const newUser = {
                    ...response.data.createUser,
                    index: users.length + 1
                };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                router.push('/user')
            }
        } catch (error) {
            toast.error("Something went wrong! Please try again");
            console.error('Error creating user:', error);
        } finally {
            setLoading(false);
        }
    };




    return (
        <>
            <div className="ml-14 w-1/2 space-y-6">
                <h1 className="text-nashtech font-semibold mb-5">Create New Asset</h1>
                <Form {...form}>
                    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <div className="flex items-center gap-5">
                                        <FormLabel className="w-[120px]">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder=""
                                                {...field}
                                                className={`cursor-pointer ${fieldState.error ? "border-nashtech" : ""
                                                    }`}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="text-nashtech float-left ml-26">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <div className="flex items-center gap-5">
                                        <FormLabel className="w-[120px]">Category</FormLabel>
                                        <FormControl>
                                            <>
                                                <Select
                                                    {...field}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    defaultValue={Type.Staff}>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            className="cursor-pointer"
                                                            ref={field.ref}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-graycustom2 text-black">
                                                        <SelectItem value={Type.Admin}>Laptop</SelectItem>
                                                        <SelectItem value={Type.Staff}>Monitor</SelectItem>
                                                        <div className="relative mb-6 text-black">
                                                            <input type="text" id="input-group-1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@flowbite.com" />
                                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                                                <CheckIcon />
                                                            </div>
                                                        </div>
                                                    </SelectContent>
                                                </Select>
                                            </>
                                        </FormControl>
                                    </div>
                                    <FormMessage className="text-nashtech float-left ml-26">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <div className="flex items-center gap-5">
                                        <FormLabel className="w-[120px]">Specification</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Select a date"
                                                {...field}
                                                type="date"
                                                className={`flex justify-end cursor-pointer flex-col ${fieldState.error ? "border-nashtech" : ""
                                                    }`}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="text-nashtech float-left ml-26">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="joinedDate"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <div className="flex items-center gap-5">
                                        <FormLabel className="w-[120px]">Installed Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder=""
                                                {...field}
                                                type="date"
                                                className={`flex justify-end cursor-pointer flex-col ${fieldState.error ? "border-nashtech" : ""
                                                    }`}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="text-nashtech float-left ml-26">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="gender"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <div className="flex">
                                        <FormLabel className="w-[110px]">State</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                {...field}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className="cursor-pointer">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value={Gender.Male} id="option-one" />
                                                    <Label htmlFor="option-one">Available</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value={Gender.Female}
                                                        id="option-two"
                                                    />
                                                    <Label htmlFor="option-two">Not Available</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                    </div>
                                    <FormMessage className="text-nashtech float-left ml-26">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <div className="float-right">
                            <Button
                                type="submit"
                                className="bg-nashtech text-white mr-4 cursor-pointer"
                                disabled={!allFieldsFilled}>
                                Save
                            </Button>
                            <Button type="button" onClick={() => setShowModalCancel(true)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
            <DetailModal
                isOpen={showModalCancel}
                onClose={handleCloseCancelModal}
                title="Are you sure">
                <div className="bg-white sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <p className="text-md text-gray-500">
                                Do you want to cancel changes?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 sm:flex sm:flex-row-reverse gap-4">
                    <Button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setShowModalCancel(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleDiscard}>
                        Discard
                    </Button>
                </div>
            </DetailModal>
        </>
    );
};

export default CreateAsset;
