import { useState } from 'react';

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

    function handleSave(field) {
        // TODO: save to Supabase
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