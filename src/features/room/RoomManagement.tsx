import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';
import {
  Home,
  FileText,
  ShoppingBag,
  ListFilter,
  Plus,
  CheckCircle,
  Clock,
  Zap,
  Wifi,
  Droplet,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import { BillViewer } from '@/components/ui/BillViewer';
import { getFileUrl } from '@/lib/utils';

// Schemas
const rentSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM'),
  rentAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
});

const billSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM'),
  type: z.enum(['electricity', 'water', 'internet']),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be positive'),
  units: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
});

const purchaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be positive'),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be positive'),
  shop: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  warrantyMonths: z.string().optional(),
  category: z.enum(['kitchen', 'masalas', 'cleaning', 'furniture', 'gas', 'other']),
});

const inventorySchema = z.object({
  item: z.enum(['fan', 'chair', 'table', 'mattress', 'induction', 'gas_stove', 'other']),
  customName: z.string().optional(),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be positive'),
  status: z.enum(['working', 'repair', 'disposed']),
});

type RentSchema = z.infer<typeof rentSchema>;
type BillSchema = z.infer<typeof billSchema>;
type PurchaseSchema = z.infer<typeof purchaseSchema>;
type InventorySchema = z.infer<typeof inventorySchema>;

export const RoomManagement: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // TABS
  const [activeTab, setActiveTab] = useState<'rents' | 'bills' | 'purchases' | 'inventory'>('rents');

  // Modal Open states
  const [isRentOpen, setIsRentOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Viewer Modal State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | undefined>(undefined);
  const [viewerTitle, setViewerTitle] = useState<string | undefined>(undefined);

  // Queries
  const {
    rents,
    bills,
    purchases,
    inventory,
    isLoadingRents,
    isLoadingBills,
    isLoadingPurchases,
    isLoadingInventory,
    createRent,
    payRent,
    createBill,
    payBill,
    createPurchase,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  } = useRoom();

  const { data: settings } = useSettings();
  const currency = settings?.currency || 'INR';

  // Forms
  const { register: regRent, handleSubmit: handleRent, reset: resetRent, formState: { errors: rentErr, isSubmitting: isSubmittingRent } } = useForm<RentSchema>({ resolver: zodResolver(rentSchema) });
  const { register: regBill, handleSubmit: handleBill, reset: resetBill, formState: { errors: billErr, isSubmitting: isSubmittingBill } } = useForm<BillSchema>({ resolver: zodResolver(billSchema) });
  const { register: regPurchase, handleSubmit: handlePurchase, reset: resetPurchase, formState: { errors: purchaseErr, isSubmitting: isSubmittingPurchase } } = useForm<PurchaseSchema>({ resolver: zodResolver(purchaseSchema) });
  const { register: regInventory, handleSubmit: handleInventory, reset: resetInventory, formState: { errors: invErr, isSubmitting: isSubmittingInventory } } = useForm<InventorySchema>({ resolver: zodResolver(inventorySchema) });

  // Dropzone
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      enqueueSnackbar('Bill invoice photo attached', { variant: 'success' });
    }
  };
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  // Submit handers
  const onSubmitRent = async (data: RentSchema) => {
    try {
      await createRent({ ...data, rentAmount: Number(data.rentAmount) });
      enqueueSnackbar('Rent invoice created', { variant: 'success' });
      setIsRentOpen(false);
      resetRent();
    } catch {
      enqueueSnackbar('Failed to create rent', { variant: 'error' });
    }
  };

  const onSubmitBill = async (data: BillSchema) => {
    try {
      await createBill({
        ...data,
        amount: Number(data.amount),
        units: data.units ? Number(data.units) : undefined,
      });
      enqueueSnackbar('Utility bill logged', { variant: 'success' });
      setIsBillOpen(false);
      resetBill();
    } catch {
      enqueueSnackbar('Failed to log bill', { variant: 'error' });
    }
  };

  const onSubmitPurchase = async (data: PurchaseSchema) => {
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('price', data.price);
      fd.append('quantity', data.quantity);
      fd.append('category', data.category);
      fd.append('date', data.date);
      if (data.shop) fd.append('shop', data.shop);
      if (data.warrantyMonths) fd.append('warrantyMonths', data.warrantyMonths);
      if (selectedFile) fd.append('bill', selectedFile);

      await createPurchase(fd);
      enqueueSnackbar('Room purchase logged', { variant: 'success' });
      setIsPurchaseOpen(false);
      resetPurchase();
      setSelectedFile(null);
    } catch {
      enqueueSnackbar('Failed to log room purchase', { variant: 'error' });
    }
  };

  const onSubmitInventory = async (data: InventorySchema) => {
    try {
      await createInventoryItem({
        ...data,
        quantity: Number(data.quantity),
      });
      enqueueSnackbar('Inventory item added', { variant: 'success' });
      setIsInventoryOpen(false);
      resetInventory();
    } catch {
      enqueueSnackbar('Failed to add item', { variant: 'error' });
    }
  };

  const handlePayRent = async (id: string) => {
    try {
      await payRent({ id });
      enqueueSnackbar('Rent marked as paid', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update rent', { variant: 'error' });
    }
  };

  const handlePayBill = async (id: string) => {
    try {
      await payBill(id);
      enqueueSnackbar('Bill marked as paid', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update bill', { variant: 'error' });
    }
  };

  const toggleInventoryStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'working' ? 'repair' : currentStatus === 'repair' ? 'disposed' : 'working';
    try {
      await updateInventoryItem({ id, status: nextStatus });
      enqueueSnackbar(`Item status updated to ${nextStatus}`, { variant: 'info' });
    } catch {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (!confirm('Remove this item from inventory?')) return;
    try {
      await deleteInventoryItem(id);
      enqueueSnackbar('Item removed', { variant: 'info' });
    } catch {
      enqueueSnackbar('Failed to remove item', { variant: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Helmet>
        <title>Room Management | Fintro</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground text-sm font-sans mt-0.5">
            Coordinate month rent schedules, shared grocery shopping, and appliance logs.
          </p>
        </div>
        
        {/* Module Add Actions */}
        <div className="flex gap-2">
          {activeTab === 'rents' && (
            <Button variant="primary" onClick={() => setIsRentOpen(true)} className="gap-1.5 font-sans">
              <Plus className="h-4 w-4" /> Add Rent
            </Button>
          )}
          {activeTab === 'bills' && (
            <Button variant="primary" onClick={() => setIsBillOpen(true)} className="gap-1.5 font-sans">
              <Plus className="h-4 w-4" /> Add Bill
            </Button>
          )}
          {activeTab === 'purchases' && (
            <Button variant="primary" onClick={() => setIsPurchaseOpen(true)} className="gap-1.5 font-sans">
              <Plus className="h-4 w-4" /> Add Purchase
            </Button>
          )}
          {activeTab === 'inventory' && (
            <Button variant="primary" onClick={() => setIsInventoryOpen(true)} className="gap-1.5 font-sans">
              <Plus className="h-4 w-4" /> Add Asset
            </Button>
          )}
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="inline-flex h-11 items-center justify-start rounded-full bg-muted p-1 text-muted-foreground self-start border border-border gap-1">
        {(['rents', 'bills', 'purchases', 'inventory'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 capitalize cursor-pointer ${
                isActive
                  ? 'bg-primary text-[#141414] shadow-sm font-semibold'
                  : 'hover:bg-card/50 hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Rent Grid view */}
      {activeTab === 'rents' && (
        <Card>
          <CardContent className="p-0">
            {isLoadingRents ? (
              <div className="py-20 flex justify-center"><LoadingSpinner /></div>
            ) : rents.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-sans">No rent history logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-4 font-semibold text-muted-foreground">Month</th>
                      <th className="p-4 font-semibold text-muted-foreground">Amount</th>
                      <th className="p-4 font-semibold text-muted-foreground">Due Date</th>
                      <th className="p-4 font-semibold text-muted-foreground">Status</th>
                      <th className="p-4 font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rents.map((r: any) => (
                      <tr key={r._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-semibold">{r.month}</td>
                        <td className="p-4 font-sans font-bold">{currency} {r.rentAmount.toLocaleString()}</td>
                        <td className="p-4 font-sans">{r.dueDate}</td>
                        <td className="p-4">
                          {r.isPaid ? (
                            <Badge variant="outline" className="text-green-600 bg-green-50 gap-1">
                              <CheckCircle className="h-3 w-3" /> Paid
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 bg-yellow-50 gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          {!r.isPaid && (
                            <Button size="sm" onClick={() => handlePayRent(r._id)} className="font-sans text-xs">
                              Mark Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bill Grid view */}
      {activeTab === 'bills' && (
        <Card>
          <CardContent className="p-0">
            {isLoadingBills ? (
              <div className="py-20 flex justify-center"><LoadingSpinner /></div>
            ) : bills.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-sans">No bill history logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-4 font-semibold text-muted-foreground">Month</th>
                      <th className="p-4 font-semibold text-muted-foreground">Type</th>
                      <th className="p-4 font-semibold text-muted-foreground">Amount</th>
                      <th className="p-4 font-semibold text-muted-foreground">Units</th>
                      <th className="p-4 font-semibold text-muted-foreground">Due Date</th>
                      <th className="p-4 font-semibold text-muted-foreground">Status</th>
                      <th className="p-4 font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b: any) => (
                      <tr key={b._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-semibold">{b.month}</td>
                        <td className="p-4 flex items-center gap-1.5 uppercase font-medium text-xs text-muted-foreground">
                          {b.type === 'electricity' && <Zap className="h-3.5 w-3.5 text-yellow-500" />}
                          {b.type === 'internet' && <Wifi className="h-3.5 w-3.5 text-blue-500" />}
                          {b.type === 'water' && <Droplet className="h-3.5 w-3.5 text-teal-500" />}
                          {b.type}
                        </td>
                        <td className="p-4 font-sans font-bold">{currency} {b.amount.toLocaleString()}</td>
                        <td className="p-4 font-sans">{b.units || '-'}</td>
                        <td className="p-4 font-sans">{b.dueDate}</td>
                        <td className="p-4">
                          {b.isPaid ? (
                            <Badge variant="outline" className="text-green-600 bg-green-50">Paid</Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 bg-yellow-50">Pending</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          {!b.isPaid && (
                            <Button size="sm" onClick={() => handlePayBill(b._id)} className="font-sans text-xs">
                              Mark Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shared purchases Grid view */}
      {activeTab === 'purchases' && (
        <Card>
          <CardContent className="p-0">
            {isLoadingPurchases ? (
              <div className="py-20 flex justify-center"><LoadingSpinner /></div>
            ) : purchases.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-sans">No shared purchases logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-4 font-semibold text-muted-foreground">Item Name</th>
                      <th className="p-4 font-semibold text-muted-foreground">Price</th>
                      <th className="p-4 font-semibold text-muted-foreground">Quantity</th>
                      <th className="p-4 font-semibold text-muted-foreground">Category</th>
                      <th className="p-4 font-semibold text-muted-foreground">Date</th>
                      <th className="p-4 font-semibold text-muted-foreground">Warranty</th>
                      <th className="p-4 font-semibold text-muted-foreground">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p: any) => (
                      <tr key={p._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-semibold">
                          <span>{p.name}</span>
                          {p.shop && <span className="text-[10px] text-muted-foreground block font-sans font-medium mt-0.5">Shop: {p.shop}</span>}
                        </td>
                        <td className="p-4 font-sans font-bold">{currency} {p.price.toLocaleString()}</td>
                        <td className="p-4 font-sans">{p.quantity}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize text-xs">{p.category}</Badge>
                        </td>
                        <td className="p-4 font-sans">{p.date}</td>
                        <td className="p-4 font-sans text-xs text-muted-foreground">
                          {p.warrantyMonths ? `${p.warrantyMonths} Months` : 'None'}
                        </td>
                        <td className="p-4 text-left">
                          {p.billImage && p.billImage !== 'null' ? (
                            <button
                              onClick={() => {
                                setViewerUrl(getFileUrl(p.billImage));
                                setViewerTitle(`Invoice: ${p.name}`);
                                setIsViewerOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs font-sans bg-transparent border-0 cursor-pointer p-0"
                            >
                              <ImageIcon className="h-3.5 w-3.5" /> View Invoice
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-sans italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Asset Inventory Grid view */}
      {activeTab === 'inventory' && (
        <Card>
          <CardContent className="p-0">
            {isLoadingInventory ? (
              <div className="py-20 flex justify-center"><LoadingSpinner /></div>
            ) : inventory.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-sans">No room appliances audited.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-4 font-semibold text-muted-foreground">Appliance Type</th>
                      <th className="p-4 font-semibold text-muted-foreground">Quantity</th>
                      <th className="p-4 font-semibold text-muted-foreground">Audit Status</th>
                      <th className="p-4 font-semibold text-muted-foreground">Last Audited</th>
                      <th className="p-4 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((inv: any) => (
                      <tr key={inv._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-semibold uppercase text-xs">
                          {inv.item.replace('_', ' ')}
                          {inv.customName && <span className="text-[10px] text-muted-foreground block capitalize mt-0.5">{inv.customName}</span>}
                        </td>
                        <td className="p-4 font-sans">{inv.quantity}</td>
                        <td className="p-4">
                          <button onClick={() => toggleInventoryStatus(inv._id, inv.status)} className="focus:outline-none">
                            {inv.status === 'working' && (
                              <Badge variant="outline" className="text-green-600 bg-green-50 cursor-pointer">Working</Badge>
                            )}
                            {inv.status === 'repair' && (
                              <Badge variant="outline" className="text-yellow-600 bg-yellow-50 cursor-pointer">Needs Repair</Badge>
                            )}
                            {inv.status === 'disposed' && (
                              <Badge variant="outline" className="text-red-600 bg-red-50 cursor-pointer">Disposed</Badge>
                            )}
                          </button>
                        </td>
                        <td className="p-4 font-sans text-xs text-muted-foreground">{inv.lastChecked}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteInventory(inv._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* RENT DIALOG */}
      <Dialog isOpen={isRentOpen} onClose={() => setIsRentOpen(false)} title="Add Rent Schedule">
        <form onSubmit={handleRent(onSubmitRent)} className="space-y-4 text-left">
          <Input label="Month (YYYY-MM)" placeholder="e.g. 2026-07" error={rentErr.month?.message} {...regRent('month')} />
          <Input label="Rent Amount" placeholder="0.00" error={rentErr.rentAmount?.message} {...regRent('rentAmount')} />
          <Input label="Due Date" type="date" error={rentErr.dueDate?.message} {...regRent('dueDate')} />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmittingRent}>
              {isSubmittingRent ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* BILL DIALOG */}
      <Dialog isOpen={isBillOpen} onClose={() => setIsBillOpen(false)} title="Log Utility Bill">
        <form onSubmit={handleBill(onSubmitBill)} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Month (YYYY-MM)" placeholder="e.g. 2026-07" error={billErr.month?.message} {...regBill('month')} />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none">Utility Type</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none" {...regBill('type')}>
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
                <option value="internet">Internet</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bill Amount" placeholder="0.00" error={billErr.amount?.message} {...regBill('amount')} />
            <Input label="Units Used (For Electricity)" placeholder="Optional units" {...regBill('units')} />
          </div>
          <Input label="Due Date" type="date" error={billErr.dueDate?.message} {...regBill('dueDate')} />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmittingBill}>
              {isSubmittingBill ? 'Logging...' : 'Log Bill'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* PURCHASE DIALOG */}
      <Dialog isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} title="Log Shared Room Purchase">
        <form onSubmit={handlePurchase(onSubmitPurchase)} className="space-y-4 text-left">
          <Input label="Item Name" placeholder="E.g. Gas stove cylinder, cleaning kit, masalas" error={purchaseErr.name?.message} {...regPurchase('name')} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price Paid" placeholder="0.00" error={purchaseErr.price?.message} {...regPurchase('price')} />
            <Input label="Quantity" placeholder="1" error={purchaseErr.quantity?.message} {...regPurchase('quantity')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none">Category</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none" {...regPurchase('category')}>
                <option value="kitchen">Kitchen Items</option>
                <option value="masalas">Groceries & Masalas</option>
                <option value="cleaning">Cleaning supplies</option>
                <option value="furniture">Furniture</option>
                <option value="gas">LPG Gas refill</option>
                <option value="other">Other items</option>
              </select>
            </div>
            <Input label="Purchase Date" type="date" error={purchaseErr.date?.message} {...regPurchase('date')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Shop Name" placeholder="e.g. Zepto, local hardware" {...regPurchase('shop')} />
            <Input label="Warranty (Months)" placeholder="0" {...regPurchase('warrantyMonths')} />
          </div>

          {/* Receipt upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Attach Purchase Bill Image</label>
            <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/30 transition-colors">
              <input {...getInputProps()} />
              {selectedFile ? (
                <span className="text-xs text-foreground font-semibold">{selectedFile.name}</span>
              ) : (
                <span className="text-xs text-muted-foreground font-sans">Click to upload bill file</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmittingPurchase}>
              {isSubmittingPurchase ? 'Saving...' : 'Save Purchase'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ASSET DIALOG */}
      <Dialog isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} title="Log Inventory Appliance">
        <form onSubmit={handleInventory(onSubmitInventory)} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium leading-none">Appliance Type</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none" {...regInventory('item')}>
              <option value="fan">Fan</option>
              <option value="chair">Chair</option>
              <option value="table">Table</option>
              <option value="mattress">Mattress</option>
              <option value="induction">Induction cooktop</option>
              <option value="gas_stove">Gas Stove</option>
              <option value="other">Other item</option>
            </select>
          </div>

          <Input label="Custom Name / Description" placeholder="e.g. Study table, single bed mattress" {...regInventory('customName')} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" placeholder="1" error={invErr.quantity?.message} {...regInventory('quantity')} />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none">Initial Status</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none" {...regInventory('status')}>
                <option value="working">Working</option>
                <option value="repair">Needs Repair</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmittingInventory}>
              {isSubmittingInventory ? 'Adding...' : 'Add Asset'}
            </Button>
          </div>
        </form>
        </Dialog>

      <BillViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileUrl={viewerUrl}
        title={viewerTitle}
      />
    </div>
  );
};
export default RoomManagement;
