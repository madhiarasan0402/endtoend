import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User, Globe, Shield, CreditCard, Info, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
    gender: Yup.string().required('Required'),
    SeniorCitizen: Yup.number().required('Required'),
    Partner: Yup.string().required('Required'),
    Dependents: Yup.string().required('Required'),
    tenure: Yup.number().min(0, 'Must be positive').required('Required'),
    PhoneService: Yup.string().required('Required'),
    MultipleLines: Yup.string().required('Required'),
    InternetService: Yup.string().required('Required'),
    OnlineSecurity: Yup.string().required('Required'),
    OnlineBackup: Yup.string().required('Required'),
    DeviceProtection: Yup.string().required('Required'),
    TechSupport: Yup.string().required('Required'),
    StreamingTV: Yup.string().required('Required'),
    StreamingMovies: Yup.string().required('Required'),
    Contract: Yup.string().required('Required'),
    PaperlessBilling: Yup.string().required('Required'),
    PaymentMethod: Yup.string().required('Required'),
    MonthlyCharges: Yup.number().min(0).required('Required'),
    TotalCharges: Yup.number().min(0).required('Required'),
});

const initialValues = {
    gender: 'Female',
    SeniorCitizen: 0,
    Partner: 'Yes',
    Dependents: 'No',
    tenure: 1,
    PhoneService: 'No',
    MultipleLines: 'No phone service',
    InternetService: 'DSL',
    OnlineSecurity: 'No',
    OnlineBackup: 'Yes',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 29.85,
    TotalCharges: 29.85,
};

const SelectField = ({ label, name, options, formik, icon }) => (
    <div className="flex flex-col">
        <label className="text-[11px] font-black text-black dark:text-white uppercase mb-2 flex items-center gap-2">
            {icon}
            {label}
        </label>
        <div className="relative group">
            <select
                name={name}
                {...formik.getFieldProps(name)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-[13px] font-bold focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt} className="bg-white dark:bg-slate-900">{opt}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <ChevronDown size={16} />
            </div>
        </div>
        {formik.touched[name] && formik.errors[name] && (
            <div className="text-rose-500 text-[10px] mt-1 font-bold">{formik.errors[name]}</div>
        )}
    </div>
);

const InputField = ({ label, name, type = "text", formik, icon }) => (
    <div className="flex flex-col">
        <label className="text-[11px] font-black text-black dark:text-white uppercase mb-2 flex items-center gap-2">
            {icon}
            {label}
        </label>
        <input
            type={type}
            name={name}
            {...formik.getFieldProps(name)}
            placeholder={`Enter ${label}...`}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-[13px] font-bold focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
        {formik.touched[name] && formik.errors[name] && (
            <div className="text-rose-500 text-[10px] mt-1 font-bold">{formik.errors[name]}</div>
        )}
    </div>
);

const CollapsibleSection = ({ title, icon: Icon, children, isOpen, onToggle }) => (
    <motion.div
        layout
        className="enterprise-card mb-4"
    >
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-between p-5 collapsible-header hover:opacity-80 transition-all border-b border-slate-100 dark:border-slate-800"
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                <h3 className="text-xs font-black uppercase">{title}</h3>
            </div>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <motion.div
            layout
            initial={false}
            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
        >
            <div className="p-6 pt-0">
                {children}
            </div>
        </motion.div>
    </motion.div>
);

const PredictionForm = ({ setPrediction, setLoading }) => {
    const [openSections, setOpenSections] = React.useState({
        personal: true,
        service: true,
        features: false,
        billing: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            const loadingToast = toast.loading('Running Neural Analysis...');
            try {
                // Ensure number types for numeric fields
                const payload = {
                    ...values,
                    tenure: Number(values.tenure),
                    MonthlyCharges: Number(values.MonthlyCharges),
                    TotalCharges: Number(values.TotalCharges),
                    SeniorCitizen: Number(values.SeniorCitizen)
                };

                const response = await api.post('/predict', payload);
                setPrediction({ ...response.data, ...payload });
                toast.success('Prediction Complete', { id: loadingToast });
            } catch (error) {
                console.error("Error predicting:", error);
                const errorMsg = error.response?.data?.detail || "Prediction failed. Check connection.";
                toast.error(errorMsg, { id: loadingToast });
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <motion.form
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={formik.handleSubmit}
            className="enterprise-card p-10 rounded-3xl shadow-2xl relative overflow-hidden bg-white dark:bg-slate-900/80 transition-all"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="h-32 w-32 text-indigo-200 dark:text-indigo-500" strokeWidth={1} />
            </div>

            <div className="flex flex-col items-center text-center mb-10">
                <div className="w-12 h-1.5 bg-indigo-600 dark:bg-indigo-500 rounded-full mb-4"></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Customer Intelligence</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configure Telemetry for Neural Analysis</p>
            </div>

            <div className="space-y-1">
                <CollapsibleSection
                    title="Profile Demographics"
                    icon={User}
                    isOpen={openSections.personal}
                    onToggle={() => toggleSection('personal')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                        <SelectField label="Gender" name="gender" options={['Female', 'Male']} formik={formik} />
                        <SelectField label="Senior Citizen" name="SeniorCitizen" options={[0, 1]} formik={formik} />
                        <SelectField label="Partner" name="Partner" options={['Yes', 'No']} formik={formik} />
                        <SelectField label="Dependents" name="Dependents" options={['Yes', 'No']} formik={formik} />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title="Service Configuration"
                    icon={Globe}
                    isOpen={openSections.service}
                    onToggle={() => toggleSection('service')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        <InputField label="Tenure (Months)" name="tenure" type="number" formik={formik} />
                        <SelectField label="Phone Service" name="PhoneService" options={['Yes', 'No']} formik={formik} />
                        <SelectField label="Internet Service" name="InternetService" options={['DSL', 'Fiber optic', 'No']} formik={formik} />
                        <SelectField label="Multiple Lines" name="MultipleLines" options={['No phone service', 'No', 'Yes']} formik={formik} />
                        <SelectField label="Streaming TV" name="StreamingTV" options={['No', 'Yes', 'No internet service']} formik={formik} />
                        <SelectField label="Streaming Movies" name="StreamingMovies" options={['No', 'Yes', 'No internet service']} formik={formik} />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title="Security & Add-ons"
                    icon={Shield}
                    isOpen={openSections.features}
                    onToggle={() => toggleSection('features')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                        <SelectField label="Online Security" name="OnlineSecurity" options={['No', 'Yes', 'No internet service']} formik={formik} />
                        <SelectField label="Online Backup" name="OnlineBackup" options={['Yes', 'No', 'No internet service']} formik={formik} />
                        <SelectField label="Device Protection" name="DeviceProtection" options={['No', 'Yes', 'No internet service']} formik={formik} />
                        <SelectField label="Tech Support" name="TechSupport" options={['No', 'Yes', 'No internet service']} formik={formik} />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title="Financial Terms"
                    icon={CreditCard}
                    isOpen={openSections.billing}
                    onToggle={() => toggleSection('billing')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        <SelectField label="Contract" name="Contract" options={['Month-to-month', 'One year', 'Two year']} formik={formik} />
                        <SelectField label="Payment Method" name="PaymentMethod" options={['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']} formik={formik} />
                        <SelectField label="Paperless Billing" name="PaperlessBilling" options={['Yes', 'No']} formik={formik} />
                        <InputField label="Monthly Charges" name="MonthlyCharges" type="number" formik={formik} />
                        <InputField label="Total Charges" name="TotalCharges" type="number" formik={formik} />
                    </div>
                </CollapsibleSection>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center w-full">
                <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="relative group overflow-hidden bg-black text-white font-black py-4 px-12 rounded-xl transition-all shadow-xl shadow-slate-400/20 disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] w-fit force-black-btn"
                >
                    <span className="relative z-10 text-sm uppercase tracking-tight">
                        {formik.isSubmitting ? "Analyzing..." : "Initialize Prediction"}
                    </span>
                    {!formik.isSubmitting && (
                        <Sparkles size={16} className="relative z-10 group-hover:rotate-12 transition-transform" />
                    )}
                </button>
            </div>
        </motion.form>
    );
};

export default PredictionForm;
