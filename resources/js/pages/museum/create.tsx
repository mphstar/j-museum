import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import MuseumFormBase from './MuseumFormBase';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Museum', href: '/museum' },
  { title: 'Tambah', href: '#' }
];

export default function CreateMuseum() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title='Tambah Museum' />
      <MuseumFormBase mode='create' />
    </AppLayout>
  );
}
