import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileHeader({ user, editable = true }) {
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        name: user.name,
        bio: user.bio || '',
    });
    const bioRef = useRef(null);

    // Auto-resize bio textarea
    useEffect(() => {
        if (editingField === 'bio' && bioRef.current) {
            bioRef.current.style.height = 'auto';
            bioRef.current.style.height = `${bioRef.current.scrollHeight}px`;
        }
    }, [formData.bio, editingField]);

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

        user[field] = formData[field];
        setEditingField(null);
    }

    function handleNameKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave('name');
        } else if (e.key === 'Escape') {
            setEditingField(null);
        }
    }

    function handleBioKeyDown(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            // Manually insert a newline at the cursor position
            const { selectionStart, selectionEnd } = e.target;
            const newValue =
                formData.bio.substring(0, selectionStart) +
                '\n' +
                formData.bio.substring(selectionEnd);

            setFormData({ ...formData, bio: newValue });

            // Move cursor to after the newline
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
            }, 0);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSave('bio');
        } else if (e.key === 'Escape') {
            setEditingField(null);
        }
    }

    return (
        <div className="profile-header">
            <div className="profile-info">
                <div className="profile-name-row">
                    <label>Name {editable && (
                        <button onClick={() => handleEdit('name')} className='edit-button'>✏️</button>
                    )}</label>
                    {editingField === 'name' ? (
                        editable ? (
                            <input
                                name="name"
                                className="name-input"
                                value={formData.name}
                                onChange={handleChange}
                                onKeyDown={handleNameKeyDown}
                                onBlur={() => setEditingField(null)}
                                autoFocus
                            />
                        ) : (
                            <h2 className="name-text">{user.name}</h2>
                        )
                    ) : (
                        <h2 className="name-text">{user.name}</h2>
                    )}
                </div>

                <div className="profile-bio-row">
                    <label>Bio {editable && (
                        <button onClick={() => handleEdit('bio')} className='edit-button'>✏️</button>
                    )}</label>
                    {editingField === 'bio' ? (
                        editable ? (
                            <textarea
                                ref={bioRef}
                                className="bio-edit"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                onKeyDown={handleBioKeyDown}
                                onBlur={() => setEditingField(null)}
                                rows={1}
                                style={{ resize: 'none', overflow: 'hidden' }}
                                autoFocus
                            />
                        ) : (
                            <p className="bio-box">{user.bio || 'No bio yet.'}</p>
                        )
                    ) : (
                        <p className="bio-box">{user.bio || 'No bio yet.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}