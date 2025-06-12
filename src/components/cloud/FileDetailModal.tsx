"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  FiCalendar,
  FiDownload,
  FiFile,
  FiFolder,
  FiHardDrive,
  FiInfo,
  FiTag,
  FiUser,
  FiX
} from 'react-icons/fi';

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

interface FileDetailModalProps {
  file: CloudFile;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: CloudFile) => void;
  isDecrypting: boolean;
}

export default function FileDetailModal({ 
  file, 
  isOpen, 
  onClose, 
  onDownload, 
  isDecrypting 
}: FileDetailModalProps) {
  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FiFile className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">File Details</h2>
              <p className="text-muted-foreground">View file information and metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Name */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">{file.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FiTag className="w-4 h-4" />
              <span>{file.category || 'Other'}</span>
              <span>•</span>
              <span>{file.mime_type}</span>
            </div>
          </div>

          {/* Path */}
          {file.path !== file.name && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiFolder className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Path</span>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 font-mono">
                {file.path}
              </p>
            </div>
          )}

          {/* Owner Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Owner</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              {file.owner_details.avatar ? (
                <Image
                  src={file.owner_details.avatar || ''}
                  alt={file.owner_details.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  onError={(e) => {
                    // Hide the image if it fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <p className="font-medium text-foreground">
                  {file.owner_details.name || file.owner_details.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  {file.owner_details.email}
                </p>
              </div>
            </div>
          </div>

          {/* File Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiInfo className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Size</span>
              </div>
              <p className="text-lg font-mono text-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Upload Date</span>
              </div>
              <p className="text-sm text-foreground">
                {formatDate(file.created_at)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiHardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  file.upload_status === 'completed' ? 'bg-green-500' :
                  file.upload_status === 'pending' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <span className={`text-sm font-medium capitalize ${
                  file.upload_status === 'completed' ? 'text-green-600' :
                  file.upload_status === 'pending' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {file.upload_status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiInfo className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Storage</span>
              </div>
              <p className="text-sm text-foreground">
                {file.drive_file_id ? 'Google Drive' : 'Local Storage'}
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FiInfo className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Technical Details</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File ID:</span>
                <span className="font-mono text-foreground">{file.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner ID:</span>
                <span className="font-mono text-foreground">{file.owner}</span>
              </div>
              {file.drive_file_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drive File ID:</span>
                  <span className="font-mono text-foreground truncate max-w-[200px]">
                    {file.drive_file_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Encryption:</span>
                <span className="text-green-600 font-medium">AES-256 CTR</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={() => onDownload(file)}
              disabled={isDecrypting || file.upload_status !== 'completed'}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              {isDecrypting ? 'Decrypting...' : 'Download & Decrypt'}
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
