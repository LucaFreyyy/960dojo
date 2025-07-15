import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileHeader({ user, editable = true }) {
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

    return (
        <div className="profile-header">
            <div className="profile-info">
                <div className="profile-name-row">
                    <label>Name</label>
                    {editingField === 'name' ? (
                        editable ? (
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
                            <h2 className="name-text">{user.name}</h2>
                        )
                    ) : (
                        <>
                            <h2 className="name-text">{user.name}</h2>
                            {editable && (
                                <button onClick={() => handleEdit('name')}>Edit</button>
                            )}
                        </>
                    )}
                </div>

                <div className="profile-bio-row">
                    <label>Bio</label>
                    {editingField === 'bio' ? (
                        editable ? (
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
                            <p className="bio-box">{user.bio || 'No bio yet.'}</p>
                        )
                    ) : (
                        <>
                            <p className="bio-box">{user.bio || 'No bio yet.'}</p>
                            {editable && (
                                <button onClick={() => handleEdit('bio')}>Edit</button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
