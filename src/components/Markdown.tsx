import ReactMarkdown from "react-markdown";

interface Props {
    content: string,
    [key: string]: string    
}

export default function Markdown({content, ...rest}: Props) {
    // eslint-disable-next-line react/no-children-prop
    return <ReactMarkdown children={content} {...rest}/>
}