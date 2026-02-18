import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCategoryStore } from '../../store/Category.store';

export const CreateNewCateGoryModal = () => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const { addCategory, loading } = useCategoryStore();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            setError('Category name is required');
            return;
        }

        if (categoryName.length > 50) {
            setError('Category name must be 50 characters or less');
            return;
        }

        const result = await addCategory(categoryName.trim());

        if (result.success) {
            document.getElementById('my_modal_5').close();
            setCategoryName('');
            setError('');
        } else {
            setError(result.error?.response?.data?.message || 'Failed to create category');
        }
    };

    const handleChange = (e) => {
        setCategoryName(e.target.value);
        setError(''); 
    };
    
    const handleClose = () => {
        setCategoryName('');
        setError('');
        document.getElementById('my_modal_5').close();
    };

    return (
        <div>
            <button
                onClick={() => document.getElementById('my_modal_5').showModal()}
                className='btn btn-secondary btn-sm uppercase'>
                <span>
                    <Plus size={15} />
                </span>
                create new Category
            </button>
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create New Category</h3>
                    <label className="label">
                        <span className="label-text">Enter Category Name</span>
                        <span className="label-text-alt">{categoryName.length}/50</span>
                    </label>
                    <input
                        name="categoryName"
                        value={categoryName}
                        onChange={handleChange}
                        type="text"
                        className={`input input-bordered mt-2 w-full ${error ? 'input-error' : ''}`}
                        placeholder="e.g., Work, Personal, Travel"
                        maxLength={50}
                    />
                    {error && (
                        <label className="label">
                            <span className="label-text-alt text-error">{error}</span>
                        </label>
                    )}
                    <div className="modal-action">
                        <form method="dialog" onSubmit={handleSubmit}>
                            <button
                                type="submit"
                                className="btn btn-primary mr-3"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-neutral"
                                onClick={handleClose}
                            >
                                Close
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    )
}