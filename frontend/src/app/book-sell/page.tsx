import { BookDetails } from '@/lib/types/type';
import { useAddProductsMutation } from '@/store/api';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

const page = () => {

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [addProducts] = useAddProductsMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { register, handleSubmit, watch, setValue, reset, formState: {errors} } = useForm<BookDetails>({defaultValues: {images:[]}});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if(files && files.length > 0){
      const newFiles = Array.from(files);
      const currentFiles = watch('images') || [];
      setUploadedImages((prevImage) => 
        [...prevImage, ...newFiles.map(file => URL.createObjectURL(file))].slice(0, 4)
      );
      setValue('images', [...currentFiles, ...newFiles].slice(0, 4) as string[]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    const currentFiles = watch('images') || [];
    const uploadFiles = currentFiles.filter((_, i) => i !== index);
    setValue('images', uploadFiles);
  };

  const onSubmit = async (data: BookDetails) => {}

  return (
    <div>
      
    </div>
  )
}

export default page
