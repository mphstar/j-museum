import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import PariwisataFormBase from './PariwisataFormBase';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Pariwisata', href: '/pariwisata' },
  { title: 'Tambah', href: '#' }
];

export default function CreatePariwisata() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title='Tambah Pariwisata' />
      <PariwisataFormBase mode='create' />
    </AppLayout>
  );
}
