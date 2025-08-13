# 🖼️ Image Service Frontend Integration Guide

## Overview
This guide helps frontend developers integrate the new Image Service with club and event creation workflows. The service implements a "create first, images later" pattern for optimal user experience.

## 🎯 Integration Pattern: Create First, Images Later

### Why This Pattern?
- **Instant Feedback**: Users see success immediately (< 1 second)
- **Better UX**: No waiting for slow image uploads
- **Progressive Enhancement**: Images appear as they're uploaded
- **Error Resilience**: Entity creation succeeds even if image upload fails

### Workflow Overview
```
1. User fills form + selects images
2. Create entity immediately (club/event)
3. Show success message to user
4. Upload images in background
5. Update UI progressively as images complete
```

## 🔐 Authentication Requirements

All image operations require:
- **JWT Token**: `Authorization: Bearer <token>`
- **API Gateway Secret**: `X-API-Gateway-Secret: <secret>`

```javascript
const headers = {
  'Authorization': `Bearer ${getAuthToken()}`,
  'X-API-Gateway-Secret': process.env.NEXT_PUBLIC_API_GATEWAY_SECRET
};
```

## 🏢 Club Creation Workflow

### Step 1: Create Club Form Component

```typescript
// components/CreateClubForm.tsx
import { useState } from 'react';

interface CreateClubFormData {
  name: string;
  description: string;
  category: string;
  location: string;
  contact_email: string;
  // Images - handled separately
  logo?: File;
  cover?: File;
}

export function CreateClubForm() {
  const [formData, setFormData] = useState<CreateClubFormData>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    logo: { status: 'pending', url: null },
    cover: { status: 'pending', url: null }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Step 1: Create club immediately (fast)
      const club = await createClub(formData);
      
      // Step 2: Show success to user immediately
      toast.success(`Club "${club.name}" created successfully!`);
      
      // Step 3: Upload images in background
      uploadClubImages(club.id, logoFile, coverFile);
      
      // Step 4: Navigate to club page
      router.push(`/clubs/${club.id}`);
      
    } catch (error) {
      toast.error('Failed to create club');
    } finally {
      setIsCreating(false);
    }
  };

  // Background image upload function
  const uploadClubImages = async (clubId: string, logo?: File, cover?: File) => {
    const uploadPromises = [];

    if (logo) {
      uploadPromises.push(
        uploadClubImage(clubId, logo, 'logo')
          .then(result => {
            setUploadProgress(prev => ({
              ...prev,
              logo: { status: 'completed', url: result.url }
            }));
            toast.success('Club logo uploaded!');
          })
          .catch(error => {
            setUploadProgress(prev => ({
              ...prev,
              logo: { status: 'failed', url: null }
            }));
            toast.error('Logo upload failed');
          })
      );
    }

    if (cover) {
      uploadPromises.push(
        uploadClubImage(clubId, cover, 'cover')
          .then(result => {
            setUploadProgress(prev => ({
              ...prev,
              cover: { status: 'completed', url: result.url }
            }));
            toast.success('Club cover uploaded!');
          })
          .catch(error => {
            setUploadProgress(prev => ({
              ...prev,
              cover: { status: 'failed', url: null }
            }));
            toast.error('Cover upload failed');
          })
      );
    }

    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic club fields */}
      <input
        type="text"
        placeholder="Club Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      {/* Image upload fields */}
      <div className="space-y-4">
        <div>
          <label>Club Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />
          {uploadProgress.logo.status === 'completed' && (
            <div className="text-green-600">✅ Logo uploaded successfully</div>
          )}
        </div>
        
        <div>
          <label>Club Cover</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          {uploadProgress.cover.status === 'completed' && (
            <div className="text-green-600">✅ Cover uploaded successfully</div>
          )}
        </div>
      </div>

      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Creating Club...' : 'Create Club'}
      </button>
    </form>
  );
}
```

### Step 2: Club API Service Functions

```typescript
// services/clubService.ts

interface CreateClubRequest {
  name: string;
  description: string;
  category: string;
  location: string;
  contact_email: string;
}

interface ClubResponse {
  id: string;
  name: string;
  logo_url?: string;
  cover_url?: string;
  // ... other fields
}

// Create club without images (fast operation)
export async function createClub(clubData: CreateClubRequest): Promise<ClubResponse> {
  const response = await fetch('/api/clubs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
      'X-API-Gateway-Secret': process.env.NEXT_PUBLIC_API_GATEWAY_SECRET
    },
    body: JSON.stringify(clubData)
  });

  if (!response.ok) {
    throw new Error('Failed to create club');
  }

  const result = await response.json();
  return result.data;
}

// Upload club image (background operation)
export async function uploadClubImage(
  clubId: string, 
  imageFile: File, 
  imageType: 'logo' | 'cover'
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('type', imageType);
  formData.append('entity_id', clubId);
  formData.append('entity_type', 'club');
  formData.append('folder', 'club_management/clubs');

  const response = await fetch('/api/images/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'X-API-Gateway-Secret': process.env.NEXT_PUBLIC_API_GATEWAY_SECRET
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const result = await response.json();
  return { url: result.data.url };
}
```

## 🎉 Event Creation Workflow

### Step 1: Create Event Form Component

```typescript
// components/CreateEventForm.tsx

interface CreateEventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  club_id: string;
  // Images handled separately
  event_image?: File;
  event_logo?: File;
  gallery_images?: File[];
}

export function CreateEventForm({ clubId }: { clubId: string }) {
  const [formData, setFormData] = useState<CreateEventFormData>({ club_id: clubId });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventLogoFile, setEventLogoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState({
    event_image: { status: 'pending', url: null },
    event_logo: { status: 'pending', url: null },
    gallery: { status: 'pending', urls: [] }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Step 1: Create event immediately
      const event = await createEvent(formData);
      
      // Step 2: Show success immediately
      toast.success(`Event "${event.title}" created successfully!`);
      
      // Step 3: Upload images in background
      uploadEventImages(event.id, {
        eventImage: eventImageFile,
        eventLogo: eventLogoFile,
        gallery: galleryFiles
      });
      
      // Step 4: Navigate to event page
      router.push(`/events/${event.id}`);
      
    } catch (error) {
      toast.error('Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const uploadEventImages = async (
    eventId: string, 
    images: {
      eventImage?: File;
      eventLogo?: File;
      gallery?: File[];
    }
  ) => {
    const uploadPromises = [];

    // Upload main event image
    if (images.eventImage) {
      uploadPromises.push(
        uploadEventImage(eventId, images.eventImage, 'event_image')
          .then(result => {
            setUploadProgress(prev => ({
              ...prev,
              event_image: { status: 'completed', url: result.url }
            }));
            toast.success('Event image uploaded!');
          })
          .catch(() => {
            setUploadProgress(prev => ({
              ...prev,
              event_image: { status: 'failed', url: null }
            }));
          })
      );
    }

    // Upload event logo
    if (images.eventLogo) {
      uploadPromises.push(
        uploadEventImage(eventId, images.eventLogo, 'event_logo')
          .then(result => {
            setUploadProgress(prev => ({
              ...prev,
              event_logo: { status: 'completed', url: result.url }
            }));
            toast.success('Event logo uploaded!');
          })
          .catch(() => {
            setUploadProgress(prev => ({
              ...prev,
              event_logo: { status: 'failed', url: null }
            }));
          })
      );
    }

    // Upload gallery images
    if (images.gallery && images.gallery.length > 0) {
      uploadPromises.push(
        uploadEventGallery(eventId, images.gallery)
          .then(results => {
            setUploadProgress(prev => ({
              ...prev,
              gallery: { status: 'completed', urls: results.map(r => r.url) }
            }));
            toast.success(`${results.length} gallery images uploaded!`);
          })
          .catch(() => {
            setUploadProgress(prev => ({
              ...prev,
              gallery: { status: 'failed', urls: [] }
            }));
          })
      );
    }

    await Promise.allSettled(uploadPromises);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic event fields */}
      <input
        type="text"
        placeholder="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      
      {/* Image upload sections */}
      <div className="space-y-4">
        <div>
          <label>Event Main Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setEventImageFile(e.target.files?.[0] || null)}
          />
          {uploadProgress.event_image.status === 'completed' && (
            <div className="text-green-600">✅ Event image uploaded</div>
          )}
        </div>
        
        <div>
          <label>Event Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setEventLogoFile(e.target.files?.[0] || null)}
          />
          {uploadProgress.event_logo.status === 'completed' && (
            <div className="text-green-600">✅ Event logo uploaded</div>
          )}
        </div>
        
        <div>
          <label>Gallery Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
          />
          {uploadProgress.gallery.status === 'completed' && (
            <div className="text-green-600">
              ✅ {uploadProgress.gallery.urls.length} gallery images uploaded
            </div>
          )}
        </div>
      </div>

      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Creating Event...' : 'Create Event'}
      </button>
    </form>
  );
}
```

### Step 2: Event API Service Functions

```typescript
// services/eventService.ts

interface CreateEventRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  club_id: string;
}

interface EventResponse {
  id: string;
  title: string;
  event_image_url?: string;
  event_logo_url?: string;
  images?: string[];
  // ... other fields
}

// Create event without images (fast operation)
export async function createEvent(eventData: CreateEventRequest): Promise<EventResponse> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
      'X-API-Gateway-Secret': process.env.NEXT_PUBLIC_API_GATEWAY_SECRET
    },
    body: JSON.stringify(eventData)
  });

  if (!response.ok) {
    throw new Error('Failed to create event');
  }

  const result = await response.json();
  return result.data;
}

// Upload single event image
export async function uploadEventImage(
  eventId: string,
  imageFile: File,
  imageType: 'event_image' | 'event_logo'
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('type', imageType);
  formData.append('entity_id', eventId);
  formData.append('entity_type', 'event');
  formData.append('folder', 'club_management/events');

  const response = await fetch('/api/images/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'X-API-Gateway-Secret': process.env.NEXT_PUBLIC_API_GATEWAY_SECRET
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const result = await response.json();
  return { url: result.data.url };
}

// Upload multiple gallery images
export async function uploadEventGallery(
  eventId: string,
  imageFiles: File[]
): Promise<{ url: string }[]> {
  const formData = new FormData();
  
  // Append all images
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  formData.append('type', 'event');
  formData.append('entity_id', eventId);
  formData.append('entity_type', 'event');
  formData.append('folder', 'club_management/events/gallery');

  const response = await fetch('/api/images/upload/bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'X-API-Gateway-Secret': process.env.NEXT_PUBLIC_API_GATEWAY_SECRET
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gallery upload failed');
  }

  const result = await response.json();
  return result.data.map((item: any) => ({ url: item.url }));
}
```

## 👤 Profile Picture Upload

### Simple Profile Picture Component

```typescript
// components/ProfilePictureUpload.tsx

export function ProfilePictureUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadProfilePicture(userId, file);
      toast.success('Profile picture updated!');
      // Update user context or refresh data
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
      />
      
      {preview && (
        <div>
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-full" />
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            {uploading ? 'Uploading...' : 'Update Picture'}
          </button>
        </div>
      )}
    </div>
  );
}

// Upload profile picture
export async function uploadProfilePicture(
  userId: string,
  imageFile: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('type', 'profile');
  formData.append('entity_id', userId);
  formData.append('entity_type', 'user');
  formData.append('folder', 'club_management/profiles');

  const response = await fetch('/api/images/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'X-API-Gateway-Secret': process.env.NEXT_PUBLIC_API_GATEWAY_SECRET
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const result = await response.json();
  return { url: result.data.url };
}
```

## 🔧 Utility Functions

### Authentication Helper

```typescript
// utils/auth.ts

export function getAuthToken(): string {
  // Get from localStorage, cookies, or context
  const token = localStorage.getItem('club_management_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
}

export function getApiGatewaySecret(): string {
  const secret = process.env.NEXT_PUBLIC_API_GATEWAY_SECRET;
  if (!secret) {
    throw new Error('API Gateway secret not configured');
  }
  return secret;
}
```

### Image Upload Progress Hook

```typescript
// hooks/useImageUpload.ts

interface UploadState {
  status: 'idle' | 'uploading' | 'completed' | 'failed';
  progress?: number;
  url?: string;
  error?: string;
}

export function useImageUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});

  const uploadImage = async (
    key: string,
    file: File,
    uploadOptions: {
      type: string;
      entity_id: string;
      entity_type: string;
      folder?: string;
    }
  ) => {
    setUploads(prev => ({
      ...prev,
      [key]: { status: 'uploading', progress: 0 }
    }));

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', uploadOptions.type);
      formData.append('entity_id', uploadOptions.entity_id);
      formData.append('entity_type', uploadOptions.entity_type);
      if (uploadOptions.folder) {
        formData.append('folder', uploadOptions.folder);
      }

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-API-Gateway-Secret': getApiGatewaySecret()
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setUploads(prev => ({
        ...prev,
        [key]: { 
          status: 'completed', 
          url: result.data.url,
          progress: 100 
        }
      }));

      return result.data.url;
    } catch (error) {
      setUploads(prev => ({
        ...prev,
        [key]: { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        }
      }));
      throw error;
    }
  };

  return { uploads, uploadImage };
}
```

## 🚨 Error Handling

### Common Error Scenarios

```typescript
// utils/imageUploadErrors.ts

export function handleImageUploadError(error: any): string {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return data.error || 'You do not have permission to upload images for this entity.';
      case 400:
        if (data.error?.includes('File too large')) {
          return 'Image file is too large. Please choose a smaller file.';
        }
        if (data.error?.includes('Invalid file type')) {
          return 'Invalid file type. Please upload a valid image file.';
        }
        return data.error || 'Invalid request.';
      case 413:
        return 'Image file is too large. Maximum size is 10MB.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Upload failed. Please try again.';
    }
  }
  
  return 'Network error. Please check your connection and try again.';
}

// Usage in components:
try {
  await uploadImage(file, options);
} catch (error) {
  const errorMessage = handleImageUploadError(error);
  toast.error(errorMessage);
}
```

## 📱 UI/UX Best Practices

### Loading States

```typescript
// Show different states during the workflow
const LoadingStates = {
  CreatingClub: 'Creating club...',
  UploadingLogo: 'Uploading logo...',
  UploadingCover: 'Uploading cover...',
  Complete: 'All done!'
};

// Progress indicator component
function UploadProgress({ uploads }: { uploads: Record<string, UploadState> }) {
  const totalUploads = Object.keys(uploads).length;
  const completedUploads = Object.values(uploads).filter(u => u.status === 'completed').length;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Uploading images</span>
        <span>{completedUploads}/{totalUploads}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedUploads / totalUploads) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

### Image Preview

```typescript
// Image preview component with upload status
function ImagePreview({ 
  file, 
  uploadState, 
  onRemove 
}: { 
  file: File; 
  uploadState: UploadState; 
  onRemove: () => void; 
}) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className="relative">
      <img 
        src={previewUrl} 
        alt="Preview" 
        className="w-32 h-32 object-cover rounded-lg"
      />
      
      {/* Upload status overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
        {uploadState.status === 'uploading' && (
          <div className="text-white text-sm">Uploading...</div>
        )}
        {uploadState.status === 'completed' && (
          <div className="text-green-400 text-sm">✅ Uploaded</div>
        )}
        {uploadState.status === 'failed' && (
          <div className="text-red-400 text-sm">❌ Failed</div>
        )}
      </div>
      
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
      >
        ×
      </button>
    </div>
  );
}
```

## 🔍 Testing Your Integration

### Test Scenarios

1. **Happy Path**: Create club/event with images
2. **No Images**: Create without any images
3. **Partial Failure**: Some images fail to upload
4. **Network Issues**: Handle connection failures
5. **Permission Errors**: Test with insufficient permissions
6. **Large Files**: Test file size limits
7. **Invalid Files**: Test with non-image files

### Example Test

```typescript
// Test the complete workflow
async function testClubCreation() {
  const clubData = {
    name: 'Test Club',
    description: 'Test description',
    category: 'Technology',
    location: 'Campus',
    contact_email: 'test@club.com'
  };

  const logoFile = new File(['test'], 'logo.png', { type: 'image/png' });
  const coverFile = new File(['test'], 'cover.jpg', { type: 'image/jpeg' });

  try {
    // Should complete in < 1 second
    const club = await createClub(clubData);
    console.log('✅ Club created:', club.id);

    // Should start immediately, complete in background
    uploadClubImages(club.id, logoFile, coverFile);
    console.log('✅ Image uploads started');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}
```

## 🎉 Summary

This integration guide provides:

- **🚀 Fast User Experience**: Create entities immediately
- **🖼️ Progressive Image Loading**: Images appear as they upload
- **🔒 Secure Uploads**: Proper authentication and authorization
- **🛡️ Error Handling**: Graceful failure recovery
- **📱 Great UX**: Loading states and progress indicators

The "create first, images later" pattern ensures your users have a smooth, fast experience while still getting all the visual content they expect! 🎯
