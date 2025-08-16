"use client";

import { BookDetails } from "@/lib/types/type";
import { useAddProductsMutation } from "@/store/api";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import NoData from "../components/NoData";
import Link from "next/link";
import {
  Book,
  Camera,
  ChevronRight,
  CreditCard,
  DollarSign,
  HelpCircle,
  Loader2,
  X,
} from "lucide-react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filters } from "@/lib/Constant";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const page = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [addProducts, { isLoading }] = useAddProductsMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<BookDetails>({ defaultValues: { images: [] } });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const currentFiles = watch("images") || [];
      setUploadedImages((prevImage) =>
        [
          ...prevImage,
          ...newFiles.map((file) => URL.createObjectURL(file)),
        ].slice(0, 4)
      );
      setValue(
        "images",
        [...currentFiles, ...newFiles].slice(0, 4) as string[]
      );
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    const currentFiles = watch("images") || [];
    const uploadFiles = currentFiles.filter((_, i) => i !== index);
    setValue("images", uploadFiles);
  };

  const onSubmit = async (data: BookDetails) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "images") {
          formData.append(key, value as string);
        }
      });

      if (data.paymentMode === "UPI") {
        formData.set(
          "paymentDetails",
          JSON.stringify({ upiId: data.paymentDetails.upiId })
        );
      } else if (data.paymentMode === "Bank Account") {
        formData.set(
          "paymentDetails",
          JSON.stringify({ bankDetails: data.paymentDetails.bankDetails })
        );
      }

      if (Array.isArray(data.images) && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const result = await addProducts(formData).unwrap();

      if (result.success) {
        router.push(`books/${result.data._id}`);
        toast.success("books added successfuly");
        reset();
      }
    } catch (error) {
      toast.error("faild to add the book, please try again later");
      console.log(error);
    }
  };

  const paymentMode = watch("paymentMode");

  const handleOpenLogin = () => {
    dispatch(toggleLoginDialog());
  };

  if (!user) {
    return (
      <NoData
        message="please login to access your cart"
        description="you need to logged in to view your cart and checkout"
        buttonText="Login"
        imageUrl="/images/login.jpg"
        onClick={handleOpenLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl mb-4 font-bold text-blue-600">
            Sell your used Books
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Submit a free classified add to sell your used books for cash in
            India
          </p>
          <Link
            href="#"
            className="text-blue-500 hover:underline inline-flex items-center"
          >
            Learn how it work
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* book details */}
          <div className="shadow-lg border-t-4 border-t-blue-500 rounded-lg pb-4">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
              <CardTitle className="text-2xl text-blue-700 flex items-center">
                <Book className="mr-2 h-6 w-6" />
                Book Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <Label
                  htmlFor="title"
                  className="md:w-1/4 font-medium text-gray-700"
                >
                  Add Title
                </Label>
                <div className="md:w-3/4">
                  <Input
                    {...register("title", {
                      required: "title is Required",
                    })}
                    placeholder="title"
                    type="text"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <Label
                  htmlFor="category"
                  className="md:w-1/4 font-medium text-gray-700"
                >
                  Book Type
                </Label>
                <div className="md:w-3/4">
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Book type is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.category.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <Label
                  htmlFor="condition"
                  className="md:w-1/4 font-medium text-gray-700"
                >
                  Book condition
                </Label>
                <div className="md:w-3/4">
                  <Controller
                    name="condition"
                    control={control}
                    rules={{ required: "Book condition is required" }}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        {filters.condition.map((con) => (
                          <div
                            className="flex items-center space-x-2"
                            key={con}
                          >
                            <RadioGroupItem
                              value={con.toLowerCase()}
                              id={con.toLowerCase()}
                            />
                            <Label htmlFor={con.toLowerCase()}>{con}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.condition && (
                    <p className="text-red-500 text-sm">
                      {errors.condition.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <Label
                  htmlFor="classType"
                  className="md:w-1/4 font-medium text-gray-700"
                >
                  For Class
                </Label>
                <div className="md:w-3/4">
                  <Controller
                    name="classType"
                    control={control}
                    rules={{ required: "Book type is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters.classType.map((classType) => (
                            <SelectItem key={classType} value={classType}>
                              {classType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.classType && (
                    <p className="text-red-500 text-sm">
                      {errors.classType.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <Label
                  htmlFor="subject"
                  className="md:w-1/4 font-medium text-gray-700"
                >
                  Book Subject
                </Label>
                <div className="md:w-3/4">
                  <Input
                    {...register("subject", {
                      required: "subject is Required",
                    })}
                    placeholder="enter your book subject"
                    type="text"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm">
                      {errors.subject.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block mb-2 font-medium text-gray-700">
                  Upload Photos
                </Label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-blue-500" />
                    <Label
                      htmlFor="images"
                      className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
                    >
                      click here to upload upto 4 images, ( size max 15MB each )
                    </Label>
                    <Input
                      onChange={handleImageUpload}
                      id="images"
                      type="file"
                      multiple
                      accept="images/*"
                      className="hidden"
                    />
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div className="relative" key={index}>
                          <Image
                            src={image}
                            alt={`book image ${index + 1}`}
                            width={200}
                            height={200}
                            className="rounded-lg object-cover w-full h-32 border border-gray-200"
                          />
                          <Button
                            onClick={() => removeImage(index)}
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </div>

          {/* optional details */}
          <div className="shadow-lg border-t-4 border-t-green-500 rounded-lg pb-4">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-4">
              <CardTitle className="text-2xl text-green-700 flex items-center">
                <HelpCircle className="mr-2 h-6 w-6" />
                Optional Details
              </CardTitle>
              <CardDescription>
                (Description, MRP, auther, etc...)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Book Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <Label
                          htmlFor="price"
                          className="md:w-1/4 font-medium text-gray-700"
                        >
                          MRP
                        </Label>
                        <Input
                          {...register("price", {
                            required: "price is Required",
                          })}
                          placeholder="enter your price"
                          type="text"
                          className="md:w-3/4"
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm">
                            {errors.price.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <Label
                          htmlFor="author"
                          className="md:w-1/4 font-medium text-gray-700"
                        >
                          Author
                        </Label>
                        <Input
                          {...register("author")}
                          placeholder="enter author name"
                          type="text"
                          className="md:w-3/4"
                        />
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <Label
                          htmlFor="edition"
                          className="md:w-1/4 font-medium text-gray-700"
                        >
                          Edition (Year)
                        </Label>
                        <Input
                          {...register("edition")}
                          placeholder="enter book edition year"
                          type="text"
                          className="md:w-3/4"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Add Discription</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <Label
                          htmlFor="description"
                          className="md:w-1/4 font-medium text-gray-700"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          {...register("description")}
                          placeholder="enter your description"
                          className="md:w-3/4"
                          rows={6}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </div>

          {/* Price details */}
          <div className="shadow-lg border-t-4 border-t-yellow-500 rounded-lg pb-4">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 py-4">
              <CardTitle className="text-2xl text-yellow-700 flex items-center">
                <DollarSign className="mr-2 h-6 w-6" />
                Price Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <Label
                  htmlFor="finalPrice"
                  className="md:w-1/4 font-medium text-gray-700"
                >
                  Your Price (₹)
                </Label>
                <div className="md:w-3/4">
                  <Input
                    id="finalPrice"
                    {...register("finalPrice", {
                      required: "finalPrice is Required",
                    })}
                    placeholder="enter your finalPrice"
                    type="text"
                  />
                  {errors.finalPrice && (
                    <p className="text-red-500 text-sm">
                      {errors.finalPrice.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 md:space-x-4">
                <Label className="md:w-1/4 mt-2 font-medium text-gray-700">
                  Shipping Charge
                </Label>
                <div className="md:w-3/4 space-y-2">
                  <div className="flex items-center gap-4">
                    <Input
                      id="shippingCharge"
                      {...register("shippingCharge")}
                      placeholder="enter your shippingCharge"
                      type="text"
                      className="w-full md:w-1/2"
                      disabled={watch("shippingCharge") === "free"}
                    />
                    <span className="text-sm">Or</span>
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="shippingCharge"
                        control={control}
                        rules={{ required: "Shipping charge is required" }}
                        render={({ field }) => (
                          <Checkbox
                            id="freeShipping"
                            checked={field.value === "free"}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? "free" : "");
                            }}
                          />
                        )}
                      />
                      <Label
                        htmlFor="freeShipping"
                        className="font-medium text-gray-700"
                      >
                        Free Shipping
                      </Label>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Buyers Prefer free shippig or low shipping charges.
                  </p>
                </div>
              </div>
            </CardContent>
          </div>

          {/* bank details */}
          <div className="shadow-lg border-t-4 border-t-blue-500 rounded-lg pb-4">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
              <CardTitle className="text-2xl text-blue-700 flex items-center">
                <CreditCard className="mr-2 h-6 w-6" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <Label className="md:w-1/4 font-medium text-gray-700">
                  Payment Mode
                </Label>
                <div className="space-y-2 md:w-3/4">
                  <p className="text-sm text-muted-foreground mb-2">
                    After your book is sold, in what mode would you like to
                    recive the payment
                  </p>
                  <Controller
                    name="paymentMode"
                    control={control}
                    rules={{ required: "Payment Mode is required" }}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <RadioGroupItem value="UPI" id="UPI" />
                        <Label htmlFor="UPI">UPI ID/NUMBER</Label>
                        <RadioGroupItem value="Bank Account" id="BankAccount" />
                        <Label htmlFor="BankAccount">Bank Account</Label>
                      </RadioGroup>
                    )}
                  />
                  {errors.paymentMode && (
                    <p className="text-red-500 text-sm">
                      {errors.paymentMode.message}
                    </p>
                  )}
                </div>
              </div>

              {paymentMode === "UPI" && (
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                  <Label
                    htmlFor="upiId"
                    className="md:w-1/4 font-medium text-gray-700"
                  >
                    {" "}
                    UPI ID/NUMBER{" "}
                  </Label>
                  <Input
                    {...register("paymentDetails.upiId", {
                      required: "UPI ID is Required",
                      pattern: {
                        value: /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/,
                        message: "Invalid UPI ID format",
                      },
                    })}
                    placeholder="enter your UPI ID"
                    type="text"
                  />
                  {errors.paymentDetails?.upiId && (
                    <p className="text-red-500 text-sm">
                      {errors.paymentDetails.upiId.message}
                    </p>
                  )}
                </div>
              )}
              {paymentMode === "Bank Account" && (
                <>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <Label
                      htmlFor="accountNumber"
                      className="md:w-1/4 font-medium text-gray-700"
                    >
                      {" "}
                      Account Number{" "}
                    </Label>
                    <Input
                      {...register("paymentDetails.bankDetails.accountNumber", {
                        required: "Account Number is Required",
                        pattern: {
                          value: /^[0-9]{9,18}$/,
                          message: "Invalid Account Number format",
                        },
                      })}
                      placeholder="enter your Account Number"
                      type="text"
                    />
                    {errors.paymentDetails?.bankDetails?.accountNumber && (
                      <p className="text-red-500 text-sm">
                        {
                          errors.paymentDetails.bankDetails.accountNumber
                            .message
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <Label
                      htmlFor="ifscCode"
                      className="md:w-1/4 font-medium text-gray-700"
                    >
                      {" "}
                      IFSC Code{" "}
                    </Label>
                    <Input
                      {...register("paymentDetails.bankDetails.ifscCode", {
                        required: "IFSC Code is Required",
                        pattern: {
                          value: /^[A-Z]{4}[0][A-Z0-9]{6}$/,
                          message: "Invalid IFSC Code format",
                        },
                      })}
                      placeholder="enter your IFSC Code"
                      type="text"
                    />
                    {errors.paymentDetails?.bankDetails?.ifscCode && (
                      <p className="text-red-500 text-sm">
                        {errors.paymentDetails.bankDetails.ifscCode.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <Label
                      htmlFor="bankName"
                      className="md:w-1/4 font-medium text-gray-700"
                    >
                      {" "}
                      Bank Name{" "}
                    </Label>
                    <Input
                      {...register("paymentDetails.bankDetails.bankName", {
                        required: "Bank Name is Required",
                      })}
                      placeholder="enter your Bank Name"
                      type="text"
                    />
                    {errors.paymentDetails?.bankDetails?.bankName && (
                      <p className="text-red-500 text-sm">
                        {errors.paymentDetails.bankDetails.bankName.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-60 text-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-orange-700 hover:to-orange-600 font-semibold py-6 shadow-lg rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Saving...
              </>
            ) : (
              "post your book"
            )}
          </Button>

          <p className="text-sm text-center mt-2 text-gray-600">
            By clicking "Post your book", you agree to our{" "}
            <Link
              href="/terms-of-use"
              className="text-blue-500 hover:underline"
            >
              Terms Of Use
            </Link>
            ,{" "}
            <Link
              href="privacy-policy"
              className="text-blue-500 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default page;