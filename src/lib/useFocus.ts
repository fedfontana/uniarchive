import { useRef } from "react";

export default function useFocus() {
    const htmlElRef = useRef<any>(null);
    const setFocus = () => {
        htmlElRef.current?.focus();
    };

    return [htmlElRef, setFocus];
};