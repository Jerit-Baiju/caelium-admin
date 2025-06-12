"use client";
import FileDetailModal from '@/components/cloud/FileDetailModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthContext from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiCloud,
  FiDownload,
  FiEye,
  FiFile,
  FiHardDrive,
  FiLoader,
  FiSearch,
  FiUser
} from 'react-icons/fi';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar?: string;
}

interface FileOwner {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar?: string;
}

interface CloudFile {
  id: string;
  name: string;
  owner: number;
  owner_details: FileOwner;
  size: number;
  mime_type: string;
  category: string;
  created_at: string;
  path: string;
  download_url: string;
  upload_status: 'pending' | 'completed' | 'failed';
  drive_file_id?: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CloudFile[];
}

export default function CloudFilesPage() {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState('-created_at');
  const [isDecrypting, setIsDecrypting] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
    totalPages: 0
  });

  const { authTokens } = useContext(AuthContext);

  const fetchUsers = useCallback(async () => {
    if (!authTokens?.access) return;
    
    try {
      const response = await fetch('http://localhost:8000/dash/users/', {
        headers: {
          'Authorization': `Bearer ${authTokens.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [authTokens]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const loadImagePreviews = useCallback(async (fileList: CloudFile[]) => {
    if (!authTokens?.access) return;

    const imageFiles = fileList.filter(file => 
      file.mime_type.startsWith('image/') && file.upload_status === 'completed'
    );

    const newImageUrls: Record<string, string> = {};

    for (const file of imageFiles) {
      try {
        const response = await fetch(file.download_url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokens.access}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          newImageUrls[file.id] = imageUrl;
        }
      } catch (error) {
        console.error(`Error loading preview for ${file.name}:`, error);
      }
    }

    setImageUrls(newImageUrls);
  }, [authTokens]);

  const fetchFiles = useCallback(async (page = 1) => {
    if (!authTokens?.access) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
        ordering: sortBy,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedUserId && selectedUserId !== 'all') params.append('owner', selectedUserId);

      const response = await fetch(`http://localhost:8000/dash/cloud/files/?${params}`, {
        headers: {
          'Authorization': `Bearer ${authTokens.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: ApiResponse = await response.json();
        setFiles(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: page,
          totalPages: Math.ceil(data.count / 20)
        });

        // Load image previews for image files
        loadImagePreviews(data.results);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [authTokens, sortBy, searchTerm, selectedUserId, loadImagePreviews]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFiles(1);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [fetchFiles]);

  // Cleanup effect for image URLs
  useEffect(() => {
    return () => {
      // Cleanup all blob URLs when component unmounts
      Object.values(imageUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const handleFileDownload = async (file: CloudFile) => {
    if (!authTokens?.access) return;
    
    setIsDecrypting(prev => new Set([...prev, file.id]));
    
    try {
      const response = await fetch(file.download_url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokens.access}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDecrypting(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const handleViewDetails = (file: CloudFile) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get unique users from files for filtering
  const fileOwners = [...new Set(files.map(file => file.owner_details).filter(Boolean))]
    .filter((owner, index, arr) => arr.findIndex(o => o.id === owner.id) === index);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FiCloud className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cloud Files</h1>
            <p className="text-muted-foreground">
              Manage all uploaded files across the platform with decryption support
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search files, owners, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex gap-2">
            {/* User Filter */}
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center gap-2">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                          <FiUser className="w-2 h-2 text-primary" />
                        </div>
                      )}
                      <span>{user.name || user.username}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="created_at">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="-name">Name Z-A</SelectItem>
                <SelectItem value="-size">Largest First</SelectItem>
                <SelectItem value="size">Smallest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiFile className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Files</p>
              <p className="text-lg font-semibold">{pagination.count}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiHardDrive className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold">
                {files.filter(f => f.upload_status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiLoader className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold">
                {files.filter(f => f.upload_status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-lg font-semibold">
                {files.filter(f => f.upload_status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Files Grid View Only */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-lg overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <FiCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No files found</h3>
            <p className="text-muted-foreground">
              All files are encrypted and can be decrypted for download
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewDetails(file)}
                  >
                    <div className="aspect-square bg-muted/50 relative overflow-hidden">
                      {/* Image preview logic: show preview if image, else icon */}
                      {file.mime_type.startsWith('image/') && imageUrls[file.id] ? (
                        <img
                          src={imageUrls[file.id]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageUrls(prev => {
                              const newUrls = { ...prev };
                              delete newUrls[file.id];
                              return newUrls;
                            });
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiFile className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <div className={`w-3 h-3 rounded-full border-2 border-background ${
                          file.upload_status === 'completed' ? 'bg-green-500' :
                          file.upload_status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                      </div>
                      {/* Action Buttons */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleViewDetails(file);
                          }}
                          className="p-2 bg-background/90 rounded-lg hover:bg-background transition-colors"
                          title="View details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleFileDownload(file);
                          }}
                          disabled={isDecrypting.has(file.id) || file.upload_status !== 'completed'}
                          className="p-2 bg-background/90 rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download"
                        >
                          {isDecrypting.has(file.id) ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiDownload className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-foreground text-sm truncate" title={file.name}>
                        {file.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(file.size)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {file.owner_details.avatar ? (
                          <Image
                            src={file.owner_details.avatar}
                            alt={file.owner_details.name}
                            width={16}
                            height={16}
                            className="rounded-full"
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                            <FiUser className="w-2 h-2 text-primary" />
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {file.owner_details.name || file.owner_details.username}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * 20) + 1} to{' '}
            {Math.min(pagination.currentPage * 20, pagination.count)} of{' '}
            {pagination.count} files
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => fetchFiles(pagination.currentPage - 1)}
              disabled={!pagination.previous}
              className="px-3 py-1 border border-border rounded-md hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-md">
              {pagination.currentPage}
            </span>
            
            <button
              onClick={() => fetchFiles(pagination.currentPage + 1)}
              disabled={!pagination.next}
              className="px-3 py-1 border border-border rounded-md hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* File Detail Modal */}
      {selectedFile && (
        <FileDetailModal
          file={selectedFile}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFile(null);
          }}
          onDownload={handleFileDownload}
          isDecrypting={isDecrypting.has(selectedFile.id)}
        />
      )}
    </div>
  );
}