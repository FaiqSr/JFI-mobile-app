import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

export interface EditableSelectProps {
    /** Current value (may be a picked option or a free-typed custom value). */
    value: string;
    /** Called with the picked option or the typed custom value. */
    onChangeText: (value: string) => void;
    /** Options to show for the current context (e.g. sizes for the selected job desc). */
    options?: string[];
    /** Placeholder shown on the trigger when value is empty. */
    placeholder?: string;
    /** Modal header title. */
    title?: string;
}

/**
 * A dropdown-trigger that opens a modal with a live text field plus a list of
 * options. Picking an option sets the value and closes; typing keeps a custom
 * value. When the typed value is not in the options a "Gunakan ..." row is shown
 * so the custom entry is explicit. With no options it behaves as plain text entry.
 */
export const EditableSelect: React.FC<EditableSelectProps> = ({
    value,
    onChangeText,
    options = [],
    placeholder = 'Enter value',
    title = 'Pilih',
}) => {
    const [open, setOpen] = useState(false);

    const trimmed = value.trim();
    const filtered = useMemo(() => {
        if (!trimmed) return options;
        const q = trimmed.toLowerCase();
        return options.filter((o) => o.toLowerCase().includes(q));
    }, [options, trimmed]);

    const hasExactMatch = options.some((o) => o === trimmed);
    const showCreate = trimmed.length > 0 && !hasExactMatch;

    return (
        <>
            <TouchableOpacity
                style={styles.dropdownInput}
                activeOpacity={0.7}
                onPress={() => setOpen(true)}
            >
                <Text
                    style={[styles.dropdownText, !value && styles.placeholderText]}
                    numberOfLines={1}
                >
                    {value || placeholder}
                </Text>
                <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalContent}
                        onPress={() => { }}
                    >
                        <Text style={styles.modalTitle}>{title}</Text>

                        <TextInput
                            style={styles.searchInput}
                            placeholder={placeholder}
                            placeholderTextColor="#98A2B3"
                            value={value}
                            onChangeText={onChangeText}
                            autoFocus
                        />

                        {showCreate && (
                            <TouchableOpacity
                                style={styles.createItem}
                                onPress={() => setOpen(false)}
                            >
                                <Text style={styles.createItemText}>Gunakan "{trimmed}"</Text>
                            </TouchableOpacity>
                        )}

                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item}
                            keyboardShouldPersistTaps="handled"
                            style={styles.list}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        onChangeText(item);
                                        setOpen(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.modalItemText,
                                            item === value && styles.selectedItemText,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                options.length === 0 ? (
                                    <Text style={styles.emptyText}>
                                        Ketik untuk memasukkan size.
                                    </Text>
                                ) : (
                                    <Text style={styles.emptyText}>
                                        Tidak ada pilihan cocok. Tekan "Gunakan" di atas.
                                    </Text>
                                )
                            }
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default EditableSelect;

const styles = StyleSheet.create({
    dropdownInput: {
        borderWidth: 1,
        borderColor: '#EAECF0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginBottom: 4,
    },
    dropdownText: {
        fontSize: RFValue(13),
        color: '#101828',
        flex: 1,
        marginRight: 8,
    },
    placeholderText: {
        color: '#98A2B3',
    },
    arrowIcon: {
        fontSize: RFValue(10),
        color: '#667085',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '60%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: RFValue(16),
        fontWeight: '600',
        color: '#101828',
        marginBottom: 12,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#EAECF0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: RFValue(13),
        color: '#101828',
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    list: {
        flexGrow: 0,
    },
    createItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F7',
    },
    createItemText: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#2563EB',
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F7',
    },
    modalItemText: {
        fontSize: RFValue(14),
        color: '#344054',
    },
    selectedItemText: {
        fontWeight: '700',
        color: '#101828',
    },
    emptyText: {
        fontSize: RFValue(12),
        color: '#98A2B3',
        paddingVertical: 12,
    },
});
