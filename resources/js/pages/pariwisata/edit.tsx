import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import PariwisataFormBase from './PariwisataFormBase';
import { type BreadcrumbItem } from '@/types';

const breadcrumbsBase: BreadcrumbItem[] = [
  { title: 'Pariwisata', href: '/pariwisata' }
];

export default function EditPariwisata() {
  const { item, overlays } = usePage().props as any;
  const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: 'Edit', href: '#' }];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={'Edit: ' + (item?.title || '')} />
      <PariwisataFormBase mode='edit' item={item} overlays={overlays || []} />
    </AppLayout>
  );
}
