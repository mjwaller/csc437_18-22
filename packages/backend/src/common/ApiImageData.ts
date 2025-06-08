export interface IApiImageData {
    _id: string;
    src: string;
    name: string;
    author: { id: string; username: string };
}

export interface IApiUserData {
    id: string,
    username: string
}
