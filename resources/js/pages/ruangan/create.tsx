import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import RuanganFormBase from './RuanganFormBase';

export default function CreateRuangan() {
  const { museum } = usePage().props as any;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Museum', href: '/museum' },
    { title: museum.title, href: `/museum/edit/${museum.id}` },
    { title: 'Ruangan', href: `/museum/${museum.id}/ruangan` },
    { title: 'Tambah', href: '#' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Tambah Ruangan - ${museum.title}`} />
      <RuanganFormBase mode='create' museum={museum} />
    </AppLayout>
  );
}