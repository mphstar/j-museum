import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Trash2, Eye } from 'lucide-react';
import RuanganFormBase from './RuanganFormBase';

export default function EditRuangan() {
  const { item, markers, museum } = usePage().props as any;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Museum', href: '/museum' },
    { title: museum.title, href: `/museum/edit/${museum.id}` },
    { title: 'Ruangan', href: `/museum/${museum.id}/ruangan` },
    { title: 'Edit', href: '#' }
  ];
  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit: ${item?.nama_ruangan} - ${museum.title}`} />
      <div className="flex flex-col space-y-6">
        <RuanganFormBase mode='edit' item={item} museum={museum} />
        
        
      </div>
    </AppLayout>
  );
}