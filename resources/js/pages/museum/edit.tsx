import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import MuseumFormBase from './MuseumFormBase';

const breadcrumbsBase: BreadcrumbItem[] = [
  { title: 'Museum', href: '/museum' }
];

export default function EditMuseum() {
  const { item, overlays } = usePage().props as any;
  const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: 'Edit', href: '#' }];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={'Edit: ' + (item?.title || '')} />
      <MuseumFormBase mode='edit' item={item} overlays={overlays || []} />
    </AppLayout>
  );
}
