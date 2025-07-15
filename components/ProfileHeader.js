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

        setEditingField(null);
    }

    return (
        <div className="profile-header">
            <div className="profile-picture">
                <img src={user.image} alt="Profile" />
            </div>

            <div className="profile-info">
                <div className="profile-field">
                    {editingField === 'name' ? (
                        <>
                            <input name="name" value={formData.name} onChange={handleChange} />
                            <button onClick={() => handleSave('name')}>Save</button>
                        </>
                    ) : (
                        <>
                            <h2>{user.name}</h2>
                            <button onClick={() => handleEdit('name')}>Edit</button>
                        </>
                    )}
                </div>

                <div className="profile-field">
                    {editingField === 'bio' ? (
                        <>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} />
                            <button onClick={() => handleSave('bio')}>Save</button>
                        </>
                    ) : (
                        <>
                            <p>{user.bio || 'No bio yet.'}</p>
                            <button onClick={() => handleEdit('bio')}>Edit</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
