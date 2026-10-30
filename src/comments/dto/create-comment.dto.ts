import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateCommentDto{

    @IsString()
    @IsNotEmpty({message:'Message cannot be empty'})
    @MaxLength(2000,{message:'comment is too long '})
    comment:string;
}