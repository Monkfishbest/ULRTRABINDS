import { google } from 'googleapis'
import { type GalleryPhoto, type GallerySection, getGallerySection, type GallerySectionId } from './SleeperHitPhotographyData'

type DriveFile = {
  createdTime?: string | null
  description?: string | null
  id?: string | null
  mimeType?: string | null
  name?: string | null
}

export type LoadedGallerySection = {
  photos: GalleryPhoto[]
  section: GallerySection
  source: 'drive' | 'fallback'
}

function getDriveCredentials() {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    return null
  }

  return { clientEmail, privateKey }
}

function getDriveFolderId(section: GallerySection) {
  return process.env[section.folderEnvVar]
}

async function getDriveClient() {
  const credentials = getDriveCredentials()

  if (!credentials) {
    return null
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.clientEmail,
      private_key: credentials.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  return google.drive({ version: 'v3', auth })
}

function toDrivePhoto(file: DriveFile): GalleryPhoto | null {
  if (!file.id || !file.name || !file.mimeType?.startsWith('image/')) {
    return null
  }

  const encodedMimeType = encodeURIComponent(file.mimeType)

  return {
    alt: file.name,
    caption: file.name.replace(/\.[^.]+$/, ''),
    description:
      file.description?.trim() ||
      'No abstract yet. You can add one later through the file description metadata if you want richer panel text.',
    id: file.id,
    src: `/api/drive/photo/${file.id}?mimeType=${encodedMimeType}`,
  }
}

async function listDrivePhotos(section: GallerySection): Promise<GalleryPhoto[] | null> {
  const folderId = getDriveFolderId(section)

  if (!folderId) {
    return null
  }

  const drive = await getDriveClient()

  if (!drive) {
    return null
  }

  const response = await drive.files.list({
    fields: 'files(id,name,mimeType,description,createdTime)',
    includeItemsFromAllDrives: true,
    orderBy: 'createdTime desc',
    q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
    supportsAllDrives: true,
  })

  const photos =
    response.data.files
      ?.map((file) => toDrivePhoto(file as DriveFile))
      .filter((photo): photo is GalleryPhoto => photo !== null) ?? []

  return photos.length > 0 ? photos : null
}

export async function loadGallerySection(sectionId: GallerySectionId): Promise<LoadedGallerySection> {
  const section = getGallerySection(sectionId)

  try {
    const drivePhotos = await listDrivePhotos(section)

    if (drivePhotos) {
      return {
        photos: drivePhotos,
        section,
        source: 'drive',
      }
    }
  } catch {
    // Fall through to placeholders so the gallery still renders if Drive is unavailable.
  }

  return {
    photos: section.fallbackPhotos,
    section,
    source: 'fallback',
  }
}
