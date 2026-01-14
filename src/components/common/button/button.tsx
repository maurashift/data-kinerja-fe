'use client'
import React from 'react';

interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    type?: 'reset' | 'submit' | 'button';
    className?: string;
    disabled?: boolean;
}

export const ButtonSky: React.FC<ButtonProps> = ({ children, type, className, onClick, disabled }) => {
    return (
        <button
            className={`px-3 py-1 flex justify-center items-center bg-linear-to-r cursor-pointer from-[#1679AB] to-[#188BC5] hover:from-[#188BC5] hover:to-[#1679AB] text-white rounded-lg ${className}`}
            disabled={disabled}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
export const ButtonSkyBorder: React.FC<ButtonProps> = ({ children, type, className, onClick, disabled }) => {
    return (
        <button
            className={`px-3 py-1 flex justify-center items-center bg-linear-to-r cursor-pointer border-2 border-[#1679AB] hover:bg-[#1679AB] text-[#1679AB] hover:text-white rounded-lg ${className}`}
            disabled={disabled}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
export const ButtonGreen: React.FC<ButtonProps> = ({ children, type, className, onClick, disabled }) => {
    return (
        <button
            disabled={disabled}
            type={type}
            onClick={onClick}
            className={`px-3 py-1 flex justify-center items-center bg-linear-to-r cursor-pointer from-[#6CBCB0] to-[#76D2C5] hover:from-[#76D2C5] hover:to-[#6CBCB0] text-white rounded-lg ${className}`}
        >
            {children}
        </button>
    )
}
export const ButtonGreenBorder: React.FC<ButtonProps> = ({ children, type, className, onClick, disabled }) => {
    return (
        <button
            className={`px-3 py-1 flex justify-center items-center bg-linear-to-r cursor-pointer border-2 border-[#6CBCB0] hover:bg-[#6CBCB0] text-[#6CBCB0] hover:text-white rounded-lg ${className}`}
            disabled={disabled}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
export const ButtonBlack: React.FC<ButtonProps> = ({ children, type, className, onClick, disabled }) => {
    return (
        <button
            className={`px-3 py-1 flex justify-center items-center bg-linear-to-r cursor-pointer from-[#1C201A] to-[#434848] hover:from-[#3A4238] hover:to-[#676C6F] text-white rounded-lg ${className}`}
            disabled={disabled}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
export const ButtonBlackBorder: React.FC<ButtonProps> = ({ children, type, className, onClick, disabled }) => {
    return (
        <button
            className={`px-3 py-1 flex justify-center items-center bg-linear-to-r cursor-pointer border-2 border-[#1C201A] hover:bg-[#1C201A] text-[#1C201A] hover:text-white rounded-lg ${className}`}
            disabled={disabled}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
export const ButtonRed: React.FC<ButtonProps> = ({ children, type, className, onClick, disabled }) => {
    return (
        <button
            className={`px-3 py-1 flex justify-center items-center bg-linear-to-r cursor-pointer from-[#D05555] to-[#F26464] hover:from-[#F26464] hover:to-[#D05555] text-white rounded-lg ${className}`}
            disabled={disabled}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
export const ButtonRedBorder: React.FC<ButtonProps> = ({ children, type, className, onClick, disabled }) => {
    return (
        <button
            className={`px-3 py-1 flex justify-center items-center bg-linear-to-r cursor-pointer border-2 border-[#D05555] text-[#D05555] hover:bg-[#D05555] hover:text-white rounded-lg ${className}`}
            disabled={disabled}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}