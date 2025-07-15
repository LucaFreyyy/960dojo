import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileHeader({ user }) {
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        name: user.name,
        bio: user.bio || '',
    });

    function handleEdit(field) {
        setEditingField(field);
    }

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSave(field) {
        const updates = { [field]: formData[field] };

        const { error } = await supabase
            .from('User')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            console.error('Update error:', error);
            return;
        }

        user[field] = formData[field]; // ✅ Instant local UI update
        setEditingField(null);
    }

    function compressImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = e => {
                img.src = e.target.result;
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Maintain aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    blob => {
                        if (blob) {
                            resolve(blob);
                            console.log("[Compression] Output size (bytes):", blob.size);
                        } else reject(new Error('Compression failed'));
                    },
                    'image/jpeg',
                    0.8 // Quality: 0–1
                );
            };

            img.onerror = reject;
            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    }

    async function handleImageChange(e) {
        console.log("[Image Change] File selected:", e.target.files?.[0]);
        const file = e.target.files?.[0];
        if (!file) return;

        // ✅ Compress the image
        const compressedFile = await compressImage(file, 300, 300);

        const fileExt = 'jpg';
        const fileName = `${user.id}.${fileExt}`;
        const filePath = fileName;

        // ⛔️ Must remove upsert — anon keys can't overwrite unless you have auth headers
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, compressedFile, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
            });

        if (uploadError) {
            console.error('Image upload error:', uploadError);
            return;
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(filePath);

        console.log("[URL] Public image URL:", publicUrl);

        const { error: updateError } = await supabase
            .from('User')
            .update({ image: publicUrl })
            .eq('id', user.id);

        console.log("[DB] Update result. Error:", updateError);

        if (updateError) {
            console.error('Update user image error:', updateError);
            return;
        }

        user.image = publicUrl;
        e.target.value = '';
    }

    return (
        <div className="profile-header">
            <div className="profile-picture">
                <img src={user.image} alt="Profile" />
                <label className="edit-icon">
                    ✏️
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                </label>
            </div>

            <div className="profile-info">
                <div className="profile-name-row">
                    <label>Name</label>
                    {editingField === 'name' ? (
                        <>
                            <input
                                name="name"
                                className="name-input"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <button onClick={() => handleSave('name')}>Save</button>
                        </>
                    ) : (
                        <>
                            <h2 className="name-text">{user.name}</h2>
                            <button onClick={() => handleEdit('name')}>Edit</button>
                        </>
                    )}
                </div>

                <div className="profile-bio-row">
                    <label>Bio</label>
                    {editingField === 'bio' ? (
                        <>
                            <textarea
                                className="bio-edit"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={1}
                                style={{ resize: 'none', overflow: 'hidden' }}
                                ref={(el) => {
                                    if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = `${el.scrollHeight}px`;
                                    }
                                }}
                            />
                            <button onClick={() => handleSave('bio')}>Save</button>
                        </>
                    ) : (
                        <>
                            <p className="bio-box">{user.bio || 'No bio yet.'}</p>
                            <button onClick={() => handleEdit('bio')}>Edit</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
