import { Address } from '@/lib/types/type';
import { useAddOrUpdateAddressMutation, useGetAddressQuery } from '@/store/api';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as zod from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import BookLoader from '@/lib/BookLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface AddressResponse {
  success: boolean;
  message: string;
  data: {
    addresses: Address[]
  }
}

const addressFormSchema = zod.object({
  phoneNumber: zod.string().min(10, 'Phone number must be 10 digits'),
  addressLine1: zod.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: zod.string().min(5, 'Address line 2 must be at least 5 characters').optional(),
  city: zod.string().optional(),
  state: zod.string().min(2, 'State must be at least 2 characters'),
  pincode: zod.string().min(6, 'Pincode must be 6 digits'),
})

type AddressFormValues = zod.infer<typeof addressFormSchema>;

interface CheckoutAddressProps {
  onSelectAddress: (address: Address) => void;
  selectedAddressId?: string;
}

const CheckoutAddress : React.FC<CheckoutAddressProps> = ({onSelectAddress, selectedAddressId}) => {

  const {data:addressData, isLoading} = useGetAddressQuery() as {
    data: AddressResponse | undefined;
    isLoading: boolean;
  }

  const [addOrUpdateAddress] = useAddOrUpdateAddressMutation();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null> (null);
  
  const addresses = addressData?.data.addresses || [];

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    }
  })

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    form.reset(address);
    setShowAddressForm(true);
  }

  const onSubmit = async (data:AddressFormValues) => {
    try {
      let result;
      if(editingAddress){
        const updatedAddress = {...editingAddress, ...data, addressId: editingAddress._id};
        result = await addOrUpdateAddress(updatedAddress).unwrap();
      }else{
        result = await addOrUpdateAddress(data).unwrap();
      }
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error(error)
    }
  }

  if(isLoading){
    return <BookLoader/>
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {addresses.map((address: Address) => (
          <Card
            key={address._id}
            className={`relative overflow-hidden rounded-lg border transition-all duration-300 ${selectedAddressId === address._id ? "border-blue-500 shadow-lg" : "border-gray-200 shadow-md hover:shadow-lg"}`}
          >
            <CardContent className='p-6 space-y-4'>
              <div className="flex items-center justify-between">
                <Checkbox 
                  checked={selectedAddressId === address._id}
                  onCheckedChange={() => onSelectAddress(address)}
                  className='w-5 h-5'
                />
                <div className="flex items-center justify-between">
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => handleEditAddress(address)}
                  >
                    <Pencil className='h-5 w-5 text-gray-500 hover:text-blue-500' />
                  </Button>
                </div>
              </div>

               <div className="text-sm text-gray-600">
                <p className="">{address?.addressLine1}</p>
                {address?.addressLine2 && (
                  <p>{address.addressLine2}</p>
                )}
                <p>
                  {address.city}, {address.state} {" "} {address.pincode}
                </p>
                <p className='mt-2 font-medium'>Phone: {address.phoneNumber}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddressForm} onOpenChange={setShowAddressForm} >
        <DialogTrigger asChild>
          <Button className='w-full' variant='outline'>
            <Plus className='h-4 w-4 mr-2' />{" "}
            {editingAddress ? "Update Address" : "Add Address"}
          </Button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Update Address" : "Add Address"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField 
                control={form.control}
                name='phoneNumber'
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='enter 10-digit mobile number'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name='addressLine1'
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Street address, House number'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name='addressLine2'
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Apartment, socity, unit, etc'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                 <FormField 
                control={form.control}
                name='city'
                render={({field}) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='enter your city'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
                 <FormField 
                control={form.control}
                name='state'
                render={({field}) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='enter your state'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              </div>

              <FormField 
                control={form.control}
                name='pincode'
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Pin-code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='enter your pincode'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <Button 
                type='submit'
                className='w-full'
              >
                {editingAddress ? "Update Address" : "Add Address"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CheckoutAddress
