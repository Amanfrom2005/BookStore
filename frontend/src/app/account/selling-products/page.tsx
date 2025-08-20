'use client'

import NoData from '@/app/components/NoData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import BookLoader from '@/lib/BookLoader';
import { BookDetails } from '@/lib/types/type';
import { useDeleteProductByIdMutation, useGetProductBySellerIdQuery } from '@/store/api'
import { RootState } from '@/store/store';
import { Package, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const page = () => {

  const user = useSelector((state: RootState) => state.user.user);
  const router = useRouter();
  const { data: products, isLoading } = useGetProductBySellerIdQuery(user?._id);
  const [deleteProductById] = useDeleteProductByIdMutation();
  const [books, setBooks] = useState<BookDetails[]>([]);

  useEffect(() => {
    if(products?.success){
      setBooks(products.data);
    }
  }, [products])

  if(isLoading){
    return <BookLoader/>
  }

  if (books.length === 0 ) {
    return (
      <div className="my-10 max-w-3xl justify-center mx-auto">
        <NoData
        imageUrl="/images/no-book.jpg"
        message="You haven't sold any books yet."
        description="Start selling your books to reach potential buyers. List your first book now and make it available to others."
        onClick={() => router.push("/book-sell")}
        buttonText="Sell Your First Book"
      />
      </div>
    );
  }

  const handleDeleteProduct = async(productId: string) => {
    try {
      await deleteProductById(productId).unwrap();
      toast.success('book deleted successfully');
    } catch (error) {
      toast.error('failed delete book');
    }
  }

  return (
    <div className='bg-gradient-to-b from-purple-50 to-white py-6'>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-purple-600 mb-4">Your Listed Books</h1>
          <p className="text-xl text-gray-600 mb-4">Manage and track your books</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {books.map((product: BookDetails) => (
            <Card key={product?._id} className='shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-purple-500' >
              <CardHeader className='bg-gradient-to-r from-purple-50 to-indigo-50 p-4'>
                <CardTitle className='text-xl text-purple-700 flex items-center'>
                  <Package className='mr-2 h-5 w-5' />
                  {product.title}
                </CardTitle>
                <CardDescription>
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className='p-4'>
               <div className="mb-4">
                 <Image
                  src={product?.images?.[0]}
                  alt={product?.title}
                  width={80}
                  height={100}
                  className='w-60 rounded-lg object-contain'
                />
               </div>
               <div className="space-y-2">
                <p className="text-sm text-gray-600">Category: {product.category}</p>
                <p className="text-sm text-gray-600">Class: {product.classType}</p>
                <div className="flex justify-between items-center">
                  <Badge variant='secondary' className='bg-purple-100 text-purple-800'>₹{product.finalPrice}</Badge>
                  <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                </div>
               </div>
              </CardContent>
              <CardFooter className='bg-purple-50 p-4 flex'>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDeleteProduct(product?._id)}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default page
