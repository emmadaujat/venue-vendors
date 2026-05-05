// helpers to save/load PDF files using IndexedDB
// we use IndexedDB for PDFs because localStorage has a size limit

const DB_NAME = "VenueVendorsDB";
const STORE_NAME = "complianceDocs";
const DB_VERSION = 1;

// opens the database (creates it if first time)
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "key" });
            }
        };

        req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
        req.onerror = () => reject(req.error);
    });
}

// saves a PDF into IndexedDB as base64
export async function savePDFtoDB(key: string, fileName: string, base64Data: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put({ key, fileName, data: base64Data });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// loads a PDF from IndexedDB, returns null if not there
export async function getPDFfromDB(key: string): Promise<{ fileName: string; data: string } | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
    });
}

// removes a PDF from IndexedDB
export async function deletePDFfromDB(key: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
