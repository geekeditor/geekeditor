declare namespace JSX {
    interface IntrinsicElements {
        'ge-core': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'ge-content': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        // 'xx-element2': React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement>; // Web component extended from input
    }

    interface DetailedHTMLProps {
        store?: any;
    }


}

